/**
 * Real-time Collaboration System using Supabase Realtime
 */

import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CollaborationUser {
	id: string;
	name: string;
	email: string;
	color: string;
	cursor?: {
		x: number;
		y: number;
	};
	selection?: {
		start: number;
		end: number;
	};
}

export interface CollaborationEvent {
	type: 'cursor' | 'selection' | 'edit' | 'presence' | 'lock';
	userId: string;
	sectionKey: string;
	data: any;
	timestamp: number;
}

export class CollaborationManager {
	private channel: RealtimeChannel | null = null;
	private user: CollaborationUser;
	private sectionKey: string;
	private callbacks: Map<string, (event: CollaborationEvent) => void> = new Map();
	private presenceUsers: Map<string, CollaborationUser> = new Map();
	private isConnected = false;

	constructor(user: Omit<CollaborationUser, 'color'>, sectionKey: string) {
		this.user = {
			...user,
			color: this.generateUserColor(user.id),
		};
		this.sectionKey = sectionKey;
	}

	async connect(): Promise<void> {
		if (this.isConnected) return;

		this.channel = supabase.channel(`cms:${this.sectionKey}`, {
			config: {
				broadcast: { self: true },
				presence: { key: this.user.id },
			},
		});

		// Subscribe to realtime events
		this.channel
			.on('broadcast', { event: 'collaboration' }, (payload) => {
				const event = payload.payload as CollaborationEvent;
				if (event.userId !== this.user.id) {
					this.handleEvent(event);
				}
			})
			.on('presence', { event: 'sync' }, () => {
				this.handlePresenceSync();
			})
			.on('presence', { event: 'join' }, ({ newPresences }) => {
				this.handlePresenceJoin(newPresences);
			})
			.on('presence', { event: 'leave' }, ({ leftPresences }) => {
				this.handlePresenceLeave(leftPresences);
			});

		await this.channel.subscribe((status) => {
			if (status === 'SUBSCRIBED') {
				this.isConnected = true;
				this.trackPresence();
			}
		});
	}

	async disconnect(): Promise<void> {
		if (!this.isConnected || !this.channel) return;

		await this.channel.unsubscribe();
		this.channel = null;
		this.isConnected = false;
		this.presenceUsers.clear();
	}

	async trackPresence(): Promise<void> {
		if (!this.channel) return;

		return this.channel.track({
			user_id: this.user.id,
			user_name: this.user.name,
			user_email: this.user.email,
			color: this.user.color,
			online_at: new Date().toISOString(),
		});
	}

	broadcastEvent(event: Omit<CollaborationEvent, 'userId' | 'timestamp'>): void {
		if (!this.isConnected || !this.channel) return;

		const fullEvent: CollaborationEvent = {
			...event,
			userId: this.user.id,
			timestamp: Date.now(),
		};

		this.channel.send({
			type: 'broadcast',
			event: 'collaboration',
			payload: fullEvent,
		});
	}

	updateCursor(x: number, y: number): void {
		this.user.cursor = { x, y };
		this.broadcastEvent({
			type: 'cursor',
			sectionKey: this.sectionKey,
			data: { x, y },
		});
	}

	updateSelection(start: number, end: number): void {
		this.user.selection = { start, end };
		this.broadcastEvent({
			type: 'selection',
			sectionKey: this.sectionKey,
			data: { start, end },
		});
	}

	notifyEdit(content: string, range?: { start: number; end: number }): void {
		this.broadcastEvent({
			type: 'edit',
			sectionKey: this.sectionKey,
			data: { content, range },
		});
	}

	on(eventType: string, callback: (event: CollaborationEvent) => void): void {
		this.callbacks.set(eventType, callback);
	}

	off(eventType: string): void {
		this.callbacks.delete(eventType);
	}

	private handleEvent(event: CollaborationEvent): void {
		const callback = this.callbacks.get(event.type);
		if (callback) {
			callback(event);
		}
	}

	private handlePresenceSync(): void {
		if (!this.channel) return;

		const state = this.channel.presenceState();
		this.presenceUsers.clear();

		Object.values(state).forEach((presences: any) => {
			presences.forEach((presence: any) => {
				this.presenceUsers.set(presence.user_id, {
					id: presence.user_id,
					name: presence.user_name,
					email: presence.user_email,
					color: presence.color,
				});
			});
		});
	}

	private handlePresenceJoin(presences: any[]): void {
		presences.forEach((presence: any) => {
			this.presenceUsers.set(presence.user_id, {
				id: presence.user_id,
				name: presence.user_name,
				email: presence.user_email,
				color: presence.color,
			});
		});

		// Notify about new user
		const callback = this.callbacks.get('presence');
		if (callback) {
			callback({
				type: 'presence',
				userId: 'system',
				sectionKey: this.sectionKey,
				data: { action: 'join', users: Array.from(this.presenceUsers.values()) },
				timestamp: Date.now(),
			});
		}
	}

	private handlePresenceLeave(presences: any[]): void {
		presences.forEach((presence: any) => {
			this.presenceUsers.delete(presence.user_id);
		});

		// Notify about user leaving
		const callback = this.callbacks.get('presence');
		if (callback) {
			callback({
				type: 'presence',
				userId: 'system',
				sectionKey: this.sectionKey,
				data: { action: 'leave', users: Array.from(this.presenceUsers.values()) },
				timestamp: Date.now(),
			});
		}
	}

	private generateUserColor(userId: string): string {
		const colors = [
			'#FF6B6B',
			'#4ECDC4',
			'#45B7D1',
			'#FFA07A',
			'#98D8C8',
			'#F7DC6F',
			'#BB8FCE',
			'#85C1E2',
			'#F8B739',
			'#52B788',
		];
		let hash = 0;
		for (let i = 0; i < userId.length; i++) {
			hash = userId.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}

	getConnectedUsers(): CollaborationUser[] {
		return Array.from(this.presenceUsers.values());
	}

	getCurrentUser(): CollaborationUser {
		return this.user;
	}
}

// Hook for using collaboration
import { useEffect, useRef, useState } from 'react';

export function useCollaboration(user: Omit<CollaborationUser, 'color'>, sectionKey: string) {
	const [collaboration, setCollaboration] = useState<CollaborationManager | null>(null);
	const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const managerRef = useRef<CollaborationManager | null>(null);

	useEffect(() => {
		const manager = new CollaborationManager(user, sectionKey);
		managerRef.current = manager;
		setCollaboration(manager);

		const handlePresence = (event: CollaborationEvent) => {
			if (event.data.action === 'join' || event.data.action === 'leave') {
				setConnectedUsers(event.data.users);
			}
		};

		manager.on('presence', handlePresence);

		manager.connect().then(() => {
			setIsConnected(true);
			setConnectedUsers(manager.getConnectedUsers());
		});

		return () => {
			manager.disconnect();
		};
	}, [sectionKey, user.id, user.name, user.email]);

	return {
		collaboration,
		connectedUsers,
		isConnected,
	};
}
