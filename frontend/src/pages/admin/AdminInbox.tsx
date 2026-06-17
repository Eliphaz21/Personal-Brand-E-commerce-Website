import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { 
  Search, 
  Send, 
  Trash2, 
  Loader, 
  AlertCircle,
  CheckCircle,
  Clock,
  Inbox
} from 'lucide-react';

interface SupportMessage {
  _id: string;
  guestName: string;
  guestEmail: string;
  subject: string;
  body: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
  fromUserId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export const AdminInbox: React.FC = () => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Message & Reply State
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      setError('');
      const res = await apiClient.get('/messages?limit=50');
      const data = res.data?.data?.messages || res.data?.messages || [];
      setMessages(data);
    } catch (err: any) {
      console.error('Error fetching admin messages:', err);
      setMessages([]);
      setError(
        err.response?.data?.message ||
        'Could not retrieve support messages. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = async (msg: SupportMessage) => {
    setSelectedMessage(msg);
    setReplyText('');
    setReplyError('');
    
    // If message is unread, mark it as read automatically
    if (msg.status === 'unread') {
      try {
        await apiClient.patch(`/messages/${msg._id}/read`);
        
        // Update local state status to read
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: 'read' } : m));
        setSelectedMessage(prev => prev && prev._id === msg._id ? { ...prev, status: 'read' } : prev);
      } catch (err) {
        console.error('Error marking message as read:', err);
      }
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      setReplyError('Reply message body cannot be empty.');
      return;
    }

    setReplyError('');
    setSubmittingReply(true);

    try {
      const res = await apiClient.post(`/messages/${selectedMessage._id}/reply`, {
        adminReply: replyText.trim()
      });

      const updatedMsg = res.data?.data?.message || res.data?.message || { 
        ...selectedMessage, 
        status: 'replied', 
        adminReply: replyText.trim(),
        repliedAt: new Date().toISOString()
      };

      setSuccessMsg('Reply email sent successfully!');
      setReplyText('');
      
      // Update states
      setMessages(prev => prev.map(m => m._id === selectedMessage._id ? updatedMsg : m));
      setSelectedMessage(updatedMsg);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Error replying to message:', err);
      setReplyError(
        err.response?.data?.message || 
        'Failed to deliver email reply. Check SMTP settings.'
      );
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this support message permanently?')) {
      return;
    }

    try {
      setError('');
      await apiClient.delete(`/messages/${id}`);
      setSuccessMsg('Message deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      
      if (selectedMessage?._id === id) {
        setSelectedMessage(null);
      }
      
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError('Failed to delete support message.');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    const searchString = `${msg.guestName} ${msg.guestEmail} ${msg.subject} ${msg.body}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || msg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-inbox" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: 'calc(100vh - 120px)' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
          Support Inbox
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
          Read client inquiries, view contact messages, and dispatch reply emails.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(39, 174, 96, 0.06)',
          border: '1px solid rgba(39, 174, 96, 0.2)',
          color: 'var(--color-success)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(235, 87, 87, 0.06)',
          border: '1px solid rgba(235, 87, 87, 0.2)',
          color: 'var(--color-error)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Inbox split panel layout */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        flex: 1,
        minHeight: 0, // Allows child panels to scroll independently
        alignItems: 'stretch'
      }}>
        
        {/* LEFT PANEL: MESSAGE LIST */}
        <div className="glass-panel" style={{
          flex: '0 0 400px',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* List Search & Filter */}
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.25rem',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['', 'unread', 'read', 'replied'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: statusFilter === st ? 'var(--color-primary)' : '#fff',
                    color: statusFilter === st ? '#fff' : 'var(--color-text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  {st === '' ? 'All' : st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages scroll list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '0.75rem' }}>
                <Loader size={28} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Syncing inbox inbox...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                No support logs found matching filters.
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?._id === msg._id;
                
                return (
                  <div
                    key={msg._id}
                    onClick={() => handleSelectMessage(msg)}
                    style={{
                      padding: '1.25rem',
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      backgroundColor: isSelected 
                        ? 'rgba(74, 117, 89, 0.06)' 
                        : msg.status === 'unread' 
                          ? 'rgba(255,255,255,0.85)' 
                          : 'rgba(255,255,255,0.4)',
                      transition: 'background-color 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(74, 117, 89, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = msg.status === 'unread' 
                          ? 'rgba(255,255,255,0.85)' 
                          : 'rgba(255,255,255,0.4)';
                      }
                    }}
                  >
                    {msg.status === 'unread' && (
                      <div style={{
                        position: 'absolute',
                        left: '4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary)'
                      }} />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: msg.status === 'unread' ? 700 : 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
                        {msg.guestName}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontWeight: msg.status === 'unread' ? 700 : 500, fontSize: '0.825rem', color: 'var(--color-text-main)', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject}
                    </div>

                    <div style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                      {msg.body}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                      {/* Status label */}
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        backgroundColor: msg.status === 'replied' 
                          ? 'rgba(39, 174, 96, 0.1)' 
                          : msg.status === 'read' 
                            ? 'rgba(120, 120, 120, 0.15)' 
                            : 'rgba(212, 163, 115, 0.15)',
                        color: msg.status === 'replied' 
                          ? 'var(--color-success)' 
                          : msg.status === 'read' 
                            ? 'var(--color-text-muted)' 
                            : 'var(--color-secondary)'
                      }}>
                        {msg.status}
                      </span>

                      <button 
                        onClick={(e) => handleDeleteMessage(msg._id, e)}
                        style={{
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          padding: '0.25rem',
                          borderRadius: '4px'
                        }}
                        title="Delete Message"
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-error)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: SELECTED MESSAGE DETAILS & REPLY VIEW */}
        <div className="glass-panel" style={{
          flex: 1,
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              
              {/* Message Header info */}
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(74, 117, 89, 0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem'
                    }}>
                      {selectedMessage.guestName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.975rem', color: 'var(--color-primary-dark)' }}>{selectedMessage.guestName}</h4>
                      <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>From: {selectedMessage.guestEmail}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                    {selectedMessage.fromUserId && (
                      <span style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: '0.25rem' }}>
                        ✓ Verified Account client
                      </span>
                    )}
                  </div>
                </div>

                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                  Subject: {selectedMessage.subject}
                </h3>
              </div>

              {/* Message Body Content */}
              <div style={{ padding: '2rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: 'var(--color-text-main)',
                  whiteSpace: 'pre-line'
                }}>
                  {selectedMessage.body}
                </div>

                {/* If replied, display Admin Reply history */}
                {selectedMessage.status === 'replied' && selectedMessage.adminReply && (
                  <div style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(74, 117, 89, 0.05)',
                    border: '1px solid rgba(74, 117, 89, 0.15)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                      <span>OFFICIAL SUPPORT REPLY</span>
                      {selectedMessage.repliedAt && (
                        <span>{new Date(selectedMessage.repliedAt).toLocaleString()}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--color-text-main)', whiteSpace: 'pre-line' }}>
                      {selectedMessage.adminReply}
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Form Footer (Only if not already replied) */}
              {selectedMessage.status !== 'replied' ? (
                <form onSubmit={handleReplySubmit} style={{
                  padding: '1.5rem 2rem',
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {replyError && (
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(235, 87, 87, 0.06)',
                      border: '1px solid rgba(235, 87, 87, 0.2)',
                      color: 'var(--color-error)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={14} />
                      <span>{replyError}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                      Compose Support Reply Email
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply to this client here..."
                      style={{
                        width: '100%',
                        minHeight: '100px',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        resize: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={submittingReply}
                      className="btn btn-primary"
                      style={{
                        padding: '0.625rem 1.5rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {submittingReply ? (
                        <>
                          <Loader size={16} className="spin-animation" /> Dispatching...
                        </>
                      ) : (
                        <>
                          <Send size={14} /> Send Reply Email
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  padding: '1.5rem 2rem',
                  borderTop: '1px solid var(--color-border)',
                  backgroundColor: 'rgba(39, 174, 96, 0.02)',
                  textAlign: 'center',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--color-success)'
                }}>
                  This support inquiry has been answered. The SMTP relay delivered the reply successfully.
                </div>
              )}

            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem', color: 'var(--color-text-muted)', gap: '1rem' }}>
              <Inbox size={48} style={{ color: 'var(--color-border)' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>Select a support message from the left panel to inspect details and send email replies.</div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminInbox;
