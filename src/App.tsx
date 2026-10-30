import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { DateScheduler } from './components/DateScheduler.tsx';
import { MaterialsSection } from './components/MaterialsSection.tsx';
import { SnackDutiesSection } from './components/SnackDutiesSection.tsx';
import { PhotoGallerySection } from './components/PhotoGallerySection.tsx';
import { MemberChatbotSection } from './components/MemberChatbotSection.tsx';
import { AdminExcelPanel } from './components/AdminExcelPanel.tsx';
import { PartyGuideAndActivity } from './components/PartyGuideAndActivity.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { RsvpModal } from './components/RsvpModal.tsx';
import { PartyPassModal } from './components/PartyPassModal.tsx';

import {
  fetchCurrentParty,
  updateParty,
  voteDatePoll,
  addDatePollOption,
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  fetchDuties,
  createDuty,
  claimDuty,
  fetchRsvps,
  submitRsvp,
  fetchActivityLogs,
  resetDemoDatabase,
  fetchPhotos,
  uploadPhoto,
  likePhoto,
  deletePhoto,
  fetchChatMessages,
  sendChatMessage,
  reactChatMessage,
  askChatbot,
} from './lib/api.ts';

import type {
  Party,
  MaterialItem,
  SnackDuty,
  Rsvp,
  ActivityLog,
  User,
  MaterialStatus,
  RsvpStatus,
  PartyPhoto,
  ChatMessage,
} from './types/party.ts';

export default function App() {
  const [party, setParty] = useState<Party | null>(null);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [duties, setDuties] = useState<SnackDuty[]>([]);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial data
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [partyRes, materialsRes, dutiesRes, rsvpsRes, logsRes, photosRes, msgsRes] =
        await Promise.all([
          fetchCurrentParty(),
          fetchMaterials(),
          fetchDuties(),
          fetchRsvps(),
          fetchActivityLogs(),
          fetchPhotos().catch(() => []),
          fetchChatMessages().catch(() => []),
        ]);

      setParty(partyRes);
      setMaterials(materialsRes);
      setDuties(dutiesRes);
      setRsvps(rsvpsRes);
      setActivityLogs(logsRes);
      setPhotos(photosRes);
      setMessages(msgsRes);

      // Fetch the 7 members
      const usersRes = await fetch('/api/auth/users');
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setAllUsers(uData.users || []);

        const VALID_USER_IDS = [
          'usr_rahul',
          'usr_ankur',
          'usr_yash',
          'usr_nityanand',
          'usr_ankita',
          'usr_priyanka',
          'usr_himani',
        ];
        let storedUserId = localStorage.getItem('laiyaa_user_id');
        if (storedUserId && !VALID_USER_IDS.includes(storedUserId)) {
          localStorage.removeItem('laiyaa_user_id');
          storedUserId = null;
        }

        const matched = uData.users?.find(
          (u: User) => u.id === storedUserId && VALID_USER_IDS.includes(u.id)
        );
        // Always default to Rahul Ranjan (Admin) if no valid 7-member session
        const defaultUser =
          uData.users?.find((u: User) => u.username === 'rahul') || uData.users?.[0] || null;
        setCurrentUser(matched || defaultUser);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Poll chat messages periodically (every 5 seconds) to keep member communication live
  useEffect(() => {
    const timer = setInterval(async () => {
      try {
        const updatedMsgs = await fetchChatMessages();
        setMessages((prev) => {
          if (updatedMsgs.length !== prev.length || updatedMsgs[updatedMsgs.length - 1]?.id !== prev[prev.length - 1]?.id) {
            return updatedMsgs;
          }
          return prev;
        });
      } catch (e) {
        // quiet poll fail
      }
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#D97706', '#F59E0B', '#10B981', '#EF4444'],
      });
    } catch (e) {
      // ignore
    }
  };

  // User auth management
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('laiyaa_user_id', user.id);
    triggerConfetti();
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('laiyaa_user_id', user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('laiyaa_user_id');
  };

  // Materials handlers
  const handleClaimMaterial = async (item: MaterialItem) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const isClaimedByMe = item.assignedToMemberId === currentUser.id;

    const updates = isClaimedByMe
      ? {
          assignedToMemberId: undefined,
          assignedToUsername: undefined,
          assignedToMemberName: undefined,
          status: 'unassigned' as MaterialStatus,
          actionDesc: `Ghar se saman laane ka pledge chhoda: ${item.name}`,
          userId: currentUser.id,
          username: currentUser.username,
          userName: currentUser.name,
        }
      : {
          assignedToMemberId: currentUser.id,
          assignedToUsername: currentUser.username,
          assignedToMemberName: currentUser.name,
          status: 'pledged' as MaterialStatus,
          actionDesc: `Ghar se laane ka vada kiya: ${item.name}`,
          userId: currentUser.id,
          username: currentUser.username,
          userName: currentUser.name,
        };

    try {
      const updated = await updateMaterial(item.id, updates);
      setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      if (!isClaimedByMe) triggerConfetti();
    } catch (err) {
      console.error('Error claiming material:', err);
    }
  };

  const handleUpdateMaterialStatus = async (item: MaterialItem, newStatus: MaterialStatus) => {
    if (!currentUser) return;
    try {
      const updated = await updateMaterial(item.id, {
        status: newStatus,
        actionDesc: `Status badla ${item.name} ka -> ${newStatus}`,
        userId: currentUser.id,
        username: currentUser.username,
        userName: currentUser.name,
      });
      setMaterials((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
    } catch (err) {
      console.error('Error updating material status:', err);
    }
  };

  const handleAddMaterial = async (item: Partial<MaterialItem>) => {
    try {
      const created = await createMaterial({
        ...item,
        userId: currentUser?.id,
        username: currentUser?.username,
        userName: currentUser?.name,
      });
      setMaterials((prev) => [...prev, created]);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
    } catch (err) {
      console.error('Error adding material:', err);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteMaterial(id, currentUser?.id, currentUser?.username, currentUser?.name);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error deleting material:', err);
    }
  };

  // Duties handlers
  const handleClaimDuty = async (dutyId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedDuty = await claimDuty(
        dutyId,
        currentUser.id,
        currentUser.username,
        currentUser.name
      );
      setDuties((prev) => prev.map((d) => (d.id === updatedDuty.id ? updatedDuty : d)));
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
    } catch (err) {
      console.error('Error claiming duty:', err);
    }
  };

  const handleCreateDuty = async (duty: Partial<SnackDuty>) => {
    try {
      const created = await createDuty({
        ...duty,
        userId: currentUser?.id,
        username: currentUser?.username,
        userName: currentUser?.name,
      });
      setDuties((prev) => [...prev, created]);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error creating duty:', err);
    }
  };

  // Date and party handlers (Protected Admin Control)
  const handleVoteDate = async (optionId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedParty = await voteDatePoll(
        optionId,
        currentUser.id,
        currentUser.username,
        currentUser.name
      );
      setParty(updatedParty);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error voting date:', err);
    }
  };

  const handleAddDateOption = async (date: string, label: string) => {
    try {
      const updatedParty = await addDatePollOption(
        date,
        label,
        currentUser?.id || 'guest',
        currentUser?.username || 'member',
        currentUser?.name || 'Khiladi'
      );
      setParty(updatedParty);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
    } catch (err) {
      console.error('Error proposing date:', err);
    }
  };

  const handleUpdateParty = async (updates: Partial<Party> & { adminPassword?: string }) => {
    try {
      const updated = await updateParty({
        ...updates,
        userId: currentUser?.id,
        username: currentUser?.username,
        userName: currentUser?.name,
      });
      setParty(updated);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
      return updated;
    } catch (err: any) {
      console.error('Error updating party:', err);
      throw err;
    }
  };

  // Photo handlers (Stored in Admin's database)
  const handleUploadPhoto = async (photoData: {
    url: string;
    caption: string;
    userId: string;
    username: string;
    userName: string;
    tags?: string[];
  }) => {
    try {
      const newPhoto = await uploadPhoto(photoData);
      setPhotos((prev) => [newPhoto, ...prev]);
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
      return newPhoto;
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw err;
    }
  };

  const handleLikePhoto = async (photoId: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedPhoto = await likePhoto(photoId, currentUser.id);
      setPhotos((prev) => prev.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p)));
    } catch (err) {
      console.error('Error liking photo:', err);
    }
  };

  const handleDeletePhoto = async (photoId: string, adminPassword?: string) => {
    if (!currentUser) return;
    try {
      await deletePhoto(photoId, currentUser.id, adminPassword);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      console.error('Error deleting photo:', err);
      throw err;
    }
  };

  // Chatbot & member messaging handlers
  const handleSendMessage = async (text: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const { message, botMessage } = await sendChatMessage({
        text,
        userId: currentUser.id,
        username: currentUser.username,
        userName: currentUser.name,
      });

      setMessages((prev) => {
        const next = [...prev, message];
        if (botMessage) next.push(botMessage);
        return next;
      });

      if (botMessage) triggerConfetti();
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const updatedMsg = await reactChatMessage(messageId, emoji, currentUser.id);
      setMessages((prev) => prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m)));
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  };

  const handleAskBot = async (question: string) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const { userMessage, botMessage } = await askChatbot(
        question,
        currentUser.id,
        currentUser.username,
        currentUser.name
      );
      setMessages((prev) => [...prev, userMessage, botMessage]);
      triggerConfetti();
    } catch (err) {
      console.error('Error asking chatbot:', err);
    }
  };

  const handleRefreshMessages = async () => {
    try {
      const freshMsgs = await fetchChatMessages();
      setMessages(freshMsgs);
    } catch (e) {
      console.error('Failed to refresh messages:', e);
    }
  };

  // RSVP handlers
  const handleSubmitRsvp = async (data: {
    status: RsvpStatus;
    notes: string;
    spicinessPreference: string;
  }) => {
    if (!currentUser) return;
    try {
      const rsvp = await submitRsvp({
        userId: currentUser.id,
        username: currentUser.username,
        userName: currentUser.name,
        ...data,
      });
      setRsvps((prev) => {
        const idx = prev.findIndex((r) => r.userId === currentUser.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = rsvp;
          return next;
        }
        return [...prev, rsvp];
      });
      const logs = await fetchActivityLogs();
      setActivityLogs(logs);
      triggerConfetti();
    } catch (err) {
      console.error('Error submitting RSVP:', err);
    }
  };

  // Reset demo
  const handleResetDemo = async () => {
    if (confirm('LMS Certifications Ki 7-Member Party Data Reset Karein?')) {
      await resetDemoDatabase();
      await loadAllData();
      triggerConfetti();
    }
  };

  if (loading && !party) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl mx-auto animate-bounce">
            ल
          </div>
          <p className="text-sm font-semibold text-stone-700">
            LMS Certifications Laiyaa Party Plan Load Ho Raha Hai...
          </p>
        </div>
      </div>
    );
  }

  if (!party) return null;

  const userRsvp = currentUser ? rsvps.find((r) => r.userId === currentUser.id) : undefined;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-amber-200">
      {/* Universal Fixed/Sticky Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
        onOpenPass={() => setIsPassModalOpen(true)}
      />

      <main className="space-y-0">
        <HeroSection
          party={party}
          materials={materials}
          duties={duties}
          rsvps={rsvps}
          currentUser={currentUser}
          onOpenRsvp={() => {
            if (!currentUser) setIsAuthModalOpen(true);
            else setIsRsvpModalOpen(true);
          }}
          onOpenPass={() => setIsPassModalOpen(true)}
        />

        <DateScheduler
          party={party}
          currentUser={currentUser}
          onVoteDate={handleVoteDate}
          onAddDateOption={handleAddDateOption}
          onUpdateParty={handleUpdateParty}
        />

        <MaterialsSection
          materials={materials}
          currentUser={currentUser}
          onClaimMaterial={handleClaimMaterial}
          onUpdateStatus={handleUpdateMaterialStatus}
          onAddMaterial={handleAddMaterial}
          onDeleteMaterial={handleDeleteMaterial}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <SnackDutiesSection
          duties={duties}
          currentUser={currentUser}
          onClaimDuty={handleClaimDuty}
          onCreateDuty={handleCreateDuty}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Member Photo Gallery (Stored in Admin's Database) */}
        <PhotoGallerySection
          photos={photos}
          currentUser={currentUser}
          onUploadPhoto={handleUploadPhoto}
          onLikePhoto={handleLikePhoto}
          onDeletePhoto={handleDeletePhoto}
          onRequestLogin={() => setIsAuthModalOpen(true)}
        />

        {/* Member Communication Chatroom & AI Chatbot */}
        <MemberChatbotSection
          messages={messages}
          currentUser={currentUser}
          party={party}
          materials={materials}
          duties={duties}
          onSendMessage={handleSendMessage}
          onReactMessage={handleReactMessage}
          onAskBot={handleAskBot}
          onRequestLogin={() => setIsAuthModalOpen(true)}
          onRefreshMessages={handleRefreshMessages}
        />

        <AdminExcelPanel
          party={party}
          materials={materials}
          duties={duties}
          rsvps={rsvps}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onResetDemo={handleResetDemo}
        />

        <PartyGuideAndActivity logs={activityLogs} />
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-amber-500 text-white flex items-center justify-center font-bold text-[10px]">
              ल
            </span>
            <span className="font-bold text-stone-800">LMS Certifications Private Limited</span>
            <span>—</span>
            <span>7 Asli Khiladi · 100% Ghar Ka Saman Potluck</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#photo-gallery" className="hover:text-amber-700 transition-colors">
              Photo Gallery
            </a>
            <a href="#member-chat" className="hover:text-amber-700 transition-colors">
              Adda Chat & Bot
            </a>
            <button
              onClick={() => setIsPassModalOpen(true)}
              className="hover:text-amber-700 transition-colors"
            >
              VIP Thonga Pass
            </button>
            <a href="#admin-excel" className="hover:text-amber-700 transition-colors">
              Admin Excel (.xlsx)
            </a>
            <a
              href="/api/download-zip"
              download="laiyaa-party-planner.zip"
              className="text-amber-700 font-semibold hover:text-amber-800 transition-colors"
            >
              Download .ZIP Code
            </a>
            <button
              onClick={handleResetDemo}
              className="text-stone-400 hover:text-stone-600"
            >
              Reset Data
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        allUsers={allUsers}
      />

      <RsvpModal
        isOpen={isRsvpModalOpen}
        onClose={() => setIsRsvpModalOpen(false)}
        currentUser={currentUser}
        existingRsvp={userRsvp}
        onSubmitRsvp={handleSubmitRsvp}
        onOpenAuth={() => {
          setIsRsvpModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      <PartyPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        party={party}
        currentUser={currentUser}
        materials={materials}
        duties={duties}
        rsvps={rsvps}
      />
    </div>
  );
}
