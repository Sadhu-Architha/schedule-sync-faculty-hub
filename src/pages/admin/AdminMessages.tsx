
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, MessageSquare } from "lucide-react";

const AdminMessages = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyDialog, setShowReplyDialog] = useState(false);

  useEffect(() => {
    // Load messages from localStorage
    const messageSystem = JSON.parse(localStorage.getItem("messageSystem") || "{}");
    const loadedMessages = messageSystem.messages || [];
    
    // Sort by timestamp descending (newest first)
    setMessages(loadedMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ));
  }, []);

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  const handleSelectMessage = (message) => {
    // Mark message as read
    if (!message.read) {
      const updatedMessages = messages.map(msg => 
        msg.id === message.id ? { ...msg, read: true } : msg
      );
      
      setMessages(updatedMessages);
      
      // Update localStorage
      const messageSystem = JSON.parse(localStorage.getItem("messageSystem") || "{}");
      messageSystem.messages = updatedMessages;
      localStorage.setItem("messageSystem", JSON.stringify(messageSystem));
    }
    
    setSelectedMessage(message);
  };

  const handleOpenReplyDialog = () => {
    setShowReplyDialog(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) {
      toast({
        title: "Reply Error",
        description: "Please enter a valid reply message",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, we'll just show a success toast
    toast({
      title: "Reply Sent",
      description: `Your reply to ${selectedMessage.fromName} has been sent`,
    });
    
    // Close dialog and clear reply text
    setShowReplyDialog(false);
    setReplyText("");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-blue-800">Faculty Messages</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                Message Inbox
              </CardTitle>
              <CardDescription>
                {messages.filter(m => !m.read).length} unread messages
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="overflow-auto max-h-[600px] pr-2">
                {messages.length > 0 ? (
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-md cursor-pointer transition-colors ${
                          selectedMessage?.id === message.id
                            ? "bg-blue-100 border-blue-300 border"
                            : message.read
                            ? "bg-gray-50 hover:bg-blue-50 border border-transparent"
                            : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                        }`}
                        onClick={() => handleSelectMessage(message)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium">{message.fromName}</div>
                          {!message.read && (
                            <Badge className="bg-blue-500">New</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 truncate">{message.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(message.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No messages yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg">
                {selectedMessage ? "Message Details" : "Select a Message"}
              </CardTitle>
              <CardDescription>
                {selectedMessage ? selectedMessage.subject : "Click on a message to view its details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {selectedMessage ? (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-sm text-gray-500">From:</div>
                      <div className="text-lg font-medium">{selectedMessage.fromName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Received:</div>
                      <div>{formatDate(selectedMessage.timestamp)}</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Message:</div>
                    <div className="p-4 bg-gray-50 rounded-md border">
                      {selectedMessage.message}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleOpenReplyDialog}>
                      Reply to Faculty
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a message from the inbox to view its contents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Reply Dialog */}
      {selectedMessage && (
        <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Reply to {selectedMessage.fromName}</DialogTitle>
              <DialogDescription>
                Re: {selectedMessage.subject}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                className="min-h-[120px]"
                placeholder="Type your reply here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSendReply}>
                Send Reply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
};

export default AdminMessages;
