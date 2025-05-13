import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  User, 
  Shield, 
  Key, 
  MessageCircle, 
  Mail, 
  Trash2, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from 'firebase/auth';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize form data with user info when it's available
    if (currentUser) {
      // Extract username from displayName if available
      let username = '';
      if (currentUser.displayName) {
        // Extract username if in format "Name (username)"
        const match = currentUser.displayName.match(/\(([^)]+)\)/);
        if (match && match[1]) {
          username = '@' + match[1];
        } else {
          // If not in expected format, just use displayName
          username = '@' + currentUser.displayName.replace(/\s+/g, '').toLowerCase();
        }
      }

      setFormData({
        username: username,
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  const [settings, setSettings] = useState({
    notifications: {
      emailUpdates: true,
      taskReminders: true,
      studyReminders: true,
      achievements: true,
      marketingEmails: false,
    },
    privacy: {
      showProfile: true,
      showActivity: true,
      showStudyTime: false,
    },
    security: {
      twoFactor: false
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateUserProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Format username for displayName
      // Remove @ if it exists at the beginning
      const usernameClean = formData.username.startsWith('@') 
        ? formData.username.substring(1) 
        : formData.username;
      
      // Get the current display name and extract the name part if it exists
      let currentName = '';
      if (currentUser.displayName) {
        const nameParts = currentUser.displayName.split(' (');
        if (nameParts.length > 1) {
          currentName = nameParts[0];
        } else {
          currentName = currentUser.displayName;
        }
      }
      
      // Create new display name with format "Name (username)"
      const newDisplayName = usernameClean 
        ? `${currentName || 'User'} (${usernameClean})` 
        : currentName || 'User';
      
      await updateProfile(currentUser, {
        displayName: newDisplayName
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: string) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key as keyof typeof settings.notifications]
      }
    });
    
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handlePrivacyChange = (key: string) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key as keyof typeof settings.privacy]
      }
    });
    
    toast({
      title: "Settings updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  const handleSecurityChange = (key: string) => {
    setSettings({
      ...settings,
      security: {
        ...settings.security,
        [key]: !settings.security[key as keyof typeof settings.security]
      }
    });
    
    toast({
      title: "Settings updated",
      description: "Your security settings have been saved.",
    });
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-light">Settings</h1>
        <Settings size={24} className="text-[#f0bfdc]" />
      </div>
      
      {/* Account Settings */}
      <Card className="p-6 bg-[#eee7da] border-none shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <User className="text-[#f0bfdc]" size={22} />
          <h2 className="text-xl font-light">Account Settings</h2>
        </div>
        <Separator className="my-5 bg-black/10" />
        
        <div className="space-y-8">
          <div className="grid gap-3">
            <Label htmlFor="username" className="text-base">Username</Label>
            <Input 
              id="username" 
              name="username"
              value={formData.username} 
              onChange={handleInputChange}
              className="max-w-md bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc]" 
              placeholder="@username"
            />
            <p className="text-sm text-muted-foreground">
              This is your public display name.
            </p>
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="email" className="text-base">Email</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email} 
              readOnly
              className="max-w-md bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc] opacity-70" 
            />
            <p className="text-sm text-muted-foreground">
              This email will be used for account-related notifications. To change your email, please contact support.
            </p>
          </div>
          
          <div>
            <Button 
              className="bg-black text-white hover:bg-black/80 rounded-full px-6"
              onClick={updateUserProfile}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6 bg-[#eee7da] border-none shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <Bell className="text-[#f0bfdc]" size={22} />
          <h2 className="text-xl font-light">Notifications</h2>
        </div>
        <Separator className="my-5 bg-black/10" />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-updates" className="text-base">Email Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive important updates about your account via email
              </p>
            </div>
            <Switch 
              id="email-updates" 
              checked={settings.notifications.emailUpdates} 
              onCheckedChange={() => handleNotificationChange('emailUpdates')}
              className="data-[state=checked]:bg-[#f0bfdc]" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="task-reminders" className="text-base">Task Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders for upcoming and due tasks
              </p>
            </div>
            <Switch 
              id="task-reminders" 
              checked={settings.notifications.taskReminders} 
              onCheckedChange={() => handleNotificationChange('taskReminders')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="study-reminders" className="text-base">Study Session Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Be notified when your scheduled study sessions are about to start
              </p>
            </div>
            <Switch 
              id="study-reminders" 
              checked={settings.notifications.studyReminders} 
              onCheckedChange={() => handleNotificationChange('studyReminders')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="achievements" className="text-base">Achievements & Milestones</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when you earn badges or reach milestones
              </p>
            </div>
            <Switch 
              id="achievements" 
              checked={settings.notifications.achievements} 
              onCheckedChange={() => handleNotificationChange('achievements')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails" className="text-base">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive tips, product updates and other marketing communications
              </p>
            </div>
            <Switch 
              id="marketing-emails" 
              checked={settings.notifications.marketingEmails} 
              onCheckedChange={() => handleNotificationChange('marketingEmails')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
        </div>
      </Card>
      
      {/* Privacy */}
      <Card className="p-6 bg-[#eee7da] border-none shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <Shield className="text-[#f0bfdc]" size={22} />
          <h2 className="text-xl font-light">Privacy</h2>
        </div>
        <Separator className="my-5 bg-black/10" />
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-profile" className="text-base">Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Allow other users to see your profile
              </p>
            </div>
            <Switch 
              id="show-profile" 
              checked={settings.privacy.showProfile} 
              onCheckedChange={() => handlePrivacyChange('showProfile')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-activity" className="text-base">Activity Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Show your recent activity and achievements to other users
              </p>
            </div>
            <Switch 
              id="show-activity" 
              checked={settings.privacy.showActivity} 
              onCheckedChange={() => handlePrivacyChange('showActivity')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-study-time" className="text-base">Study Time Visibility</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your total study time
              </p>
            </div>
            <Switch 
              id="show-study-time" 
              checked={settings.privacy.showStudyTime} 
              onCheckedChange={() => handlePrivacyChange('showStudyTime')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
        </div>
      </Card>
      
      {/* Security */}
      <Card className="p-6 bg-[#eee7da] border-none shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <Key className="text-[#f0bfdc]" size={22} />
          <h2 className="text-xl font-light">Security</h2>
        </div>
        <Separator className="my-5 bg-black/10" />
        
        <div className="space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="current-password" className="text-base">Change Password</Label>
            <Input 
              id="current-password" 
              type="password" 
              placeholder="Current password" 
              className="max-w-md bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc]" 
            />
            <Input 
              id="new-password" 
              type="password" 
              placeholder="New password" 
              className="max-w-md bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc]" 
            />
            <Input 
              id="confirm-password" 
              type="password" 
              placeholder="Confirm password" 
              className="max-w-md bg-white border-none shadow-sm focus-visible:ring-[#f0bfdc]" 
            />
            <div>
              <Button className="mt-2 bg-black text-white hover:bg-black/80 rounded-full px-6">
                Update Password
              </Button>
            </div>
          </div>
          
          <Separator className="my-6 bg-black/10" />
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor" className="text-base">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              id="two-factor" 
              checked={settings.security.twoFactor} 
              onCheckedChange={() => handleSecurityChange('twoFactor')} 
              className="data-[state=checked]:bg-[#f0bfdc]"
            />
          </div>
        </div>
      </Card>
      
      {/* Danger Zone */}
      <Card className="p-6 bg-white border border-destructive/30 shadow-sm hover:shadow-md transition-all rounded-xl">
        <div className="flex items-center gap-3 mb-5">
          <Trash2 className="text-destructive" size={22} />
          <h2 className="text-xl font-light text-destructive">Danger Zone</h2>
        </div>
        <Separator className="my-5 bg-destructive/20" />
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" className="rounded-full px-6 hover:bg-destructive/90">
              <Trash2 size={16} className="mr-2" /> Delete Account
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
