'use client';

import { useEffect, useState } from 'react';
import { toast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

type Chat = {
  id: string;
  createdAt: string;
  status: 'active' | 'in_progress' | 'expired' | 'finished';
};

type CreateChatResponse = {
  chatId: string;
  token: string;
  url: string;
};

export default function ClinicDashboard() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newChatData, setNewChatData] = useState<CreateChatResponse | null>(
    null,
  );

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/clinic/chats');

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats);
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to load chats',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/clinic/create-chat', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const data: CreateChatResponse = await response.json();
      setNewChatData(data);

      toast({
        type: 'success',
        description: 'Chat created successfully!',
      });

      // Refresh the chats list
      fetchChats();
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to create chat',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/clinic/chats');

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats);

      toast({
        type: 'success',
        description: 'Chats refreshed successfully!',
      });
    } catch (error) {
      toast({
        type: 'error',
        description: 'Failed to refresh chats',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      type: 'success',
      description: 'Copied to clipboard!',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'finished':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Clinic Dashboard</h1>
            <p className="text-gray-600 dark:text-zinc-400 mt-2">
              Generate patient chat sessions and monitor their status
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={createNewChat} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Generate New Chat'}
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              onClick={() => signOut({ redirectTo: '/login' })}
              variant="outline"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {newChatData && (
          <div className="mb-8 p-6 border rounded-lg bg-blue-50 dark:bg-blue-950">
            <h2 className="text-xl font-semibold mb-4">New Chat Created</h2>
            <div className="space-y-3">
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chat ID
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.chatId}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.chatId)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.token}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.token)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div>
                {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient URL
                </label>
                <div className="flex gap-2 mt-1">
                  <code className="flex-1 p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                    {newChatData.url}
                  </code>
                  <Button
                    onClick={() => copyToClipboard(newChatData.url)}
                    variant="outline"
                    size="sm"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setNewChatData(null)}
              variant="ghost"
              size="sm"
              className="mt-4"
            >
              Dismiss
            </Button>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Chat ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-background divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      Loading chats...
                    </td>
                  </tr>
                ) : chats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No chats yet. Create your first chat!
                    </td>
                  </tr>
                ) : (
                  chats.map((chat) => (
                    <tr
                      key={chat.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm font-mono">{chat.id}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(chat.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            chat.status,
                          )}`}
                        >
                          {chat.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
