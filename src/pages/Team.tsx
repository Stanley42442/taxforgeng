import { useState } from "react";
import { NavMenu } from "@/components/NavMenu";
import { useSubscription } from "@/contexts/SubscriptionContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, UserPlus, Crown, Shield, Eye, Mail, Trash2, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending';
  invitedAt: Date;
}

const MOCK_MEMBERS: TeamMember[] = [
  { id: '1', email: 'owner@example.com', role: 'admin', status: 'active', invitedAt: new Date('2024-01-01') },
];

const Team = () => {
  const { tier, email } = useSubscription();
  
  const [members, setMembers] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('taxforge_ng_team');
    return saved ? JSON.parse(saved) : MOCK_MEMBERS;
  });
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer');

  const saveMembers = (newMembers: TeamMember[]) => {
    setMembers(newMembers);
    localStorage.setItem('taxforge_ng_team', JSON.stringify(newMembers));
  };

  const getMaxMembers = () => {
    if (tier === 'corporate') return Infinity;
    if (tier === 'business') return 2;
    return 0;
  };

  const canAddMember = () => {
    const currentCount = members.length - 1; // Exclude owner
    return currentCount < getMaxMembers();
  };

  const handleInvite = () => {
    if (!inviteEmail || !canAddMember()) return;

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      invitedAt: new Date(),
    };

    saveMembers([...members, newMember]);
    setInviteOpen(false);
    setInviteEmail('');
    toast.success(`Invitation sent to ${inviteEmail}`, {
      description: 'They will receive an email to join your team'
    });
  };

  const removeMember = (id: string) => {
    saveMembers(members.filter(m => m.id !== id));
    toast.success('Team member removed');
  };

  const updateRole = (id: string, role: TeamMember['role']) => {
    saveMembers(members.map(m => m.id === id ? { ...m, role } : m));
    toast.success('Role updated');
  };

  // Free/Basic tier - show upgrade
  if (tier === 'free' || tier === 'basic') {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <NavMenu />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Team Collaboration</CardTitle>
              <CardDescription>
                Invite team members to collaborate on your tax management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">Business: </span>
                    <span className="text-muted-foreground">Up to 2 team members</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <span className="font-medium">Corporate: </span>
                    <span className="text-muted-foreground">Unlimited members + roles</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Admin, Editor, and Viewer roles</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Eye className="w-5 h-5 text-primary" />
                  <span>Shared access to businesses and invoices</span>
                </div>
              </div>
              <Link to="/pricing">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Business for Team Features
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const maxMembers = getMaxMembers();
  const currentMembers = members.length - 1;
  const isCorporate = tier === 'corporate';

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col overflow-x-hidden">
      <NavMenu />
      
      <div className="container mx-auto px-4 py-6 pb-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              <Users className="inline-block w-8 h-8 mr-2 text-primary" />
              Team Settings
            </h1>
            <p className="text-muted-foreground">
              Manage team members and access permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm py-1">
              {isCorporate ? 'Unlimited' : `${currentMembers}/${maxMembers}`} members
            </Badge>
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button disabled={!canAddMember()}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your tax management team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as 'editor' | 'viewer')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <div>
                              <div>Viewer</div>
                              <div className="text-xs text-muted-foreground">Can view businesses and calculations</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            <div>
                              <div>Editor</div>
                              <div className="text-xs text-muted-foreground">Can edit and create content</div>
                            </div>
                          </div>
                        </SelectItem>
                        {isCorporate && (
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              <div>
                                <div>Admin</div>
                                <div className="text-xs text-muted-foreground">Full access including settings</div>
                              </div>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInviteOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleInvite} disabled={!inviteEmail}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              People with access to your tax management workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member, index) => (
                <div 
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {member.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 mr-3">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.email}</p>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">Owner</Badge>
                        )}
                        {member.status === 'pending' && (
                          <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                        {member.status === 'active' && index !== 0 && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {member.role} • Joined {new Date(member.invitedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {index !== 0 && (
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      {isCorporate && (
                        <Select 
                          value={member.role} 
                          onValueChange={(v) => updateRole(member.id, v as TeamMember['role'])}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {!isCorporate && (
          <Card className="mt-6 border-accent/50 bg-accent/5">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-sm">
                  Upgrade to Corporate for unlimited team members and advanced role management
                </span>
              </div>
              <div className="flex-shrink-0 ml-2">
                <Link to="/pricing">
                  <Button variant="outline" size="sm">Upgrade</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permissions Overview */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
            <CardDescription>What each role can do in your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 font-medium">Permission</th>
                    <th className="text-center py-3 font-medium">Viewer</th>
                    <th className="text-center py-3 font-medium">Editor</th>
                    <th className="text-center py-3 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3">View businesses & calculations</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                  <tr>
                    <td className="py-3">Export reports</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                  <tr>
                    <td className="py-3">Create & edit businesses</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                  <tr>
                    <td className="py-3">Create invoices</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                  <tr>
                    <td className="py-3">Manage team members</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                  <tr>
                    <td className="py-3">Billing & subscription</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center text-muted-foreground">—</td>
                    <td className="text-center"><CheckCircle2 className="w-4 h-4 mx-auto text-success" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Team;
