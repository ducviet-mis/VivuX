import { useState } from 'react';

export function useInviteLink() {
  const [copied, setCopied] = useState(false);

  const generateLink = (classId: string) => {
    const token = Math.random().toString(36).substring(7);
    return `${window.location.origin}/classroom/join?id=${classId}&token=${token}`;
  };

  const copyToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return {
    generateLink,
    copyToClipboard,
    copied
  };
}
