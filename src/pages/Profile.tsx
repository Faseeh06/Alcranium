import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Mail, Phone, MapPin, FileText, Trash2, Link as LinkIcon, Pencil, BookOpen, Award, User as UserIcon, LogOut, Save, Plus, X, Briefcase, RefreshCcw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  getProfileData, 
  saveProfileData,
  addWorkExperienceToUserDoc,
  updateWorkExperienceInUserDoc,
  deleteWorkExperienceFromUserDoc,
  addSkillToUserDoc,
  removeSkillFromUserDoc,
  addLinkToUserDoc,
  updateLinkInUserDoc,
  deleteLinkFromUserDoc,
  addEducationToUserDoc,
  updateEducationInUserDoc,
  deleteEducationFromUserDoc,
  addCertificationToUserDoc,
  updateCertificationInUserDoc,
  deleteCertificationFromUserDoc,
  addBadgeToUserDoc,
  updateBadgeInUserDoc,
  deleteBadgeFromUserDoc,
  calculateProfileCompletion,
  ProfileData as FirebaseProfileData,
  WorkExperience,
  Education,
  Certification,
  Badge as BadgeType,
  ProfileLink,
  initializeUserProfile
} from '@/lib/firebase';

// Initial empty profile data structure
const initialProfileData: FirebaseProfileData = {
  name: '',
  username: '',
  email: '',
  phone: '',
  location: '',
  resume: '', // Store filename or link
  profileComplete: 0,
  badges: [],
  workExperience: [],
  education: [],
  certifications: [],
  links: [],
  skills: []
};

// Add an error boundary component
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const { currentUser } = useAuth();
  
  const resetError = async () => {
    if (currentUser) {
      try {
        // Reinitialize the user profile
        await initializeUserProfile(currentUser);
        toast.success("Profile has been reset. Refreshing page...");
        setTimeout(() => {
          setHasError(false);
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error("Failed to reset profile:", error);
        toast.error("Could not reset profile. Please try again later.");
      }
    }
  };
  
  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Caught runtime error:", error);
      setHasError(true);
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);
  
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <h2 className="text-xl font-medium mb-4">Something went wrong with your profile</h2>
        <p className="text-muted-foreground mb-6">We encountered an error loading your profile data.</p>
        <Button onClick={resetError} className="bg-black text-white flex items-center gap-2">
          <RefreshCcw size={16} />
          Reset Profile
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
};

const Profile = () => {
  const { theme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // State to hold profile data, initialized from Firebase
  const [profileData, setProfileData] = useState<FirebaseProfileData>(initialProfileData);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track if personal info is being edited
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);

  const [newSkill, setNewSkill] = useState('');

  // State for Work Experience Modal
  const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
  const [currentWorkExperience, setCurrentWorkExperience] = useState<Partial<WorkExperience> & { index?: number }>({});
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);

  // State for Education Modal
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Partial<Education> & { index?: number }>({});
  const [editingEducationIndex, setEditingEducationIndex] = useState<number | null>(null);

  // State for Certification Modal
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<Partial<Certification> & { index?: number }>({});
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<number | null>(null);

  // State for Badge Modal
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Partial<BadgeType> & { index?: number }>({});
  const [editingBadgeIndex, setEditingBadgeIndex] = useState<number | null>(null);

  // Add resume state
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [resumeData, setResumeData] = useState({ name: '', url: '' });

  // State for Links Modal
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<Partial<ProfileLink>>({});
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);

  // State for Skills Modal
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);

  // Add state for certificate preview at the top of component with other state variables 
  const [previewCertificate, setPreviewCertificate] = useState<Certification | null>(null);

  // Fetch profile data from Firebase when component mounts or user changes
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching profile data for user:", currentUser.uid);
        setIsLoading(true);
        const data = await getProfileData(currentUser.uid);
        console.log("Fetched profile data result:", data);
        
        // Extract user display name and create username if needed
        let displayName = currentUser.displayName || 'User';
        let username = '';
        const match = displayName.match(/(.*)\s*\((.*)\)/);
        if (match) {
          displayName = match[1].trim();
          username = '@' + match[2];
        } else {
          username = '@' + displayName.replace(/\s+/g, '').toLowerCase();
        }

        if (data) {
          // Parse resume data if it exists
          let resumeName = '';
          let resumeUrl = '';
          
          if (data.resume) {
            try {
              // Check if the resume is stored as JSON string
              if (data.resume.startsWith('{') && data.resume.endsWith('}')) {
                const resumeObj = JSON.parse(data.resume);
                resumeName = resumeObj.name || '';
                resumeUrl = resumeObj.url || '';
              } else if (data.resume.includes('|')) {
                // Legacy format: "name|url"
                const parts = data.resume.split('|');
                resumeName = parts[0] || '';
                resumeUrl = parts[1] || '';
              } else {
                // Just a URL
                resumeUrl = data.resume;
                resumeName = 'My Resume';
              }
            } catch (e) {
              console.error("Error parsing resume data:", e);
              resumeUrl = data.resume;
              resumeName = 'My Resume';
            }
          }
          
          setResumeData({ name: resumeName, url: resumeUrl });
          
          // If we have data in Firebase, use it but ensure auth data takes precedence for crucial fields
          setProfileData({
            ...data,
            // Always use auth data for email and name
            email: currentUser.email || data.email || '',
            name: data.name || displayName,
            username: data.username || username
          });
          
          console.log("Profile data set successfully from Firebase");
        } else {
          console.log("No existing profile data found, initializing with Auth data");
          // Otherwise initialize with basic data from Auth
          const newProfileData = {
            ...initialProfileData,
            name: displayName,
            username: username,
            email: currentUser.email || ''
          };
          
          setProfileData(newProfileData);
          setResumeData({ name: '', url: '' });
          
          // Also save this initial data to Firebase
          console.log("Saving initial profile data to Firebase");
          await saveProfileData(currentUser.uid, newProfileData);
        }
      } catch (error) {
        console.error("Critical Error fetching profile data in useEffect:", error);
        
        // Log the detailed error object
        if (error instanceof Error) {
          console.error("Detailed error message:", error.message);
          console.error("Stack trace:", error.stack);
        }
        
        toast.error("Failed to load profile data. Check console for details.");
        
        // Fallback to at least showing the current user's basic info
        if (currentUser) {
          let displayName = currentUser.displayName || 'User';
          let username = '';
          const match = displayName.match(/(.*)\s*\((.*)\)/);
          if (match) {
            displayName = match[1].trim();
            username = '@' + match[2];
          } else {
            username = '@' + displayName.replace(/\s+/g, '').toLowerCase();
          }
          
          setProfileData(prev => ({
            ...prev,
            name: displayName,
            username: username,
            email: currentUser.email || ''
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser]);

  // Handle changes in input fields (Generic)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Specific handler for newSkill input
    if (name === 'newSkill') {
      setNewSkill(value);
    } else {
      // Handle profileData fields
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Add a new skill
  const addSkillHandler = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to add skills");
      return;
    }
    
    const skillToAdd = newSkill.trim();
    if (skillToAdd && !profileData.skills.includes(skillToAdd)) {
      console.log(`[Profile.tsx] addSkillHandler: Attempting to add skill: '${skillToAdd}'`);
      try {
        // Use the new function that adds directly to the user document
        await addSkillToUserDoc(currentUser.uid, skillToAdd);
        console.log(`[Profile.tsx] addSkillHandler: Successfully added skill '${skillToAdd}'`);
        
        // Update local state
        const updatedSkills = [...profileData.skills, skillToAdd];
        setProfileData(prev => ({
          ...prev,
          skills: updatedSkills,
          profileComplete: calculateProfileCompletion({ ...prev, skills: updatedSkills })
        }));
        
        setNewSkill('');
        setIsSkillModalOpen(false); // Close the modal
        toast.success(`Skill "${skillToAdd}" added`);
      } catch (error) {
        console.error(`[Profile.tsx] addSkillHandler: Error adding skill '${skillToAdd}':`, error);
        toast.error("Failed to add skill. Check console.");
      }
    } else if (profileData.skills.includes(skillToAdd)) {
      toast.info(`Skill "${skillToAdd}" already exists`);
    } else {
      toast.warning("Please enter a skill name");
    }
  };

  // Remove a skill
  const removeSkill = async (skillToRemove: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to remove skills");
      return;
    }
    
    try {
      // Use the new function that removes directly from the user document
      await removeSkillFromUserDoc(currentUser.uid, skillToRemove);
      
      // Update local state
      const updatedSkills = profileData.skills.filter(skill => skill !== skillToRemove);
      setProfileData(prev => ({
        ...prev,
        skills: updatedSkills,
        profileComplete: calculateProfileCompletion({ ...prev, skills: updatedSkills })
      }));
      
      toast.info(`Skill "${skillToRemove}" removed`);
    } catch (error) {
      console.error(`[Profile.tsx] removeSkill: Error removing skill '${skillToRemove}':`, error);
      toast.error("Failed to remove skill. Check console.");
    }
  };

  // Toggle edit mode for personal info
  const toggleEditPersonalInfo = async () => {
    if (isEditingPersonalInfo && currentUser) {
      // Saving changes when toggling off edit mode
      try {
        console.log("Attempting to save profile data:", {
          uid: currentUser.uid,
          profileData
        });
        
        // Create a minimal clean data object to avoid undefined fields
        const minimalData = {
          name: profileData.name || '',
          username: profileData.username || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          resume: profileData.resume || ''
        };
        
        await saveProfileData(currentUser.uid, minimalData);
        toast.success("Personal info updated");
      } catch (error) {
        console.error("Error saving profile data:", error);
        // Show more detailed error message
        if (error instanceof Error) {
          toast.error(`Failed to save personal info: ${error.message}`);
        } else {
          toast.error("Failed to save personal info");
        }
      }
    }
    
    setIsEditingPersonalInfo(!isEditingPersonalInfo);
  };

  // --- Work Experience Functions ---
  const openAddWorkModal = () => {
    setCurrentWorkExperience({});
    setEditingWorkIndex(null);
    setIsWorkModalOpen(true);
  };

  const openEditWorkModal = (experience: WorkExperience, index: number) => {
    setCurrentWorkExperience({ ...experience, index });
    setEditingWorkIndex(index);
    setIsWorkModalOpen(true);
  };

  const handleWorkExperienceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentWorkExperience(prev => ({ ...prev, [name]: value }));
  };

  const saveWorkExperience = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to save work experience");
      return;
    }
    
    if (!currentWorkExperience.company || !currentWorkExperience.role || !currentWorkExperience.period) {
      toast.error("Please fill in Company, Role, and Period for work experience.");
      return;
    }

    try {
      let updatedExperience;
      
      // Prepare work experience data
      const workExpData = {
        company: currentWorkExperience.company || '',
        role: currentWorkExperience.role || '',
        period: currentWorkExperience.period || '',
        location: currentWorkExperience.location || '',
        description: currentWorkExperience.description || ''
      };
      
      console.log("[Profile.tsx] saveWorkExperience: Attempting to save work experience:", { 
        isEditing: editingWorkIndex !== null, 
        id: currentWorkExperience.id, 
        data: workExpData 
      });
      
      if (editingWorkIndex !== null && currentWorkExperience.id) {
        // Editing existing work experience
        console.log(`[Profile.tsx] saveWorkExperience: Editing existing work experience with ID: ${currentWorkExperience.id}`);
        await updateWorkExperienceInUserDoc(currentUser.uid, currentWorkExperience.id, workExpData);
        console.log(`[Profile.tsx] saveWorkExperience: Successfully updated work experience`);
        
        // Update local state
        updatedExperience = profileData.workExperience.map((item, idx) => 
          idx === editingWorkIndex ? { ...item, ...workExpData } : item
        );
        
        toast.success("Work experience updated");
      } else {
        // Adding new work experience
        console.log("[Profile.tsx] saveWorkExperience: Adding new work experience");
        const newId = await addWorkExperienceToUserDoc(currentUser.uid, workExpData);
        console.log(`[Profile.tsx] saveWorkExperience: Successfully added work experience with ID: ${newId}`);
        
        // Add to local state with the returned ID
        const newEntry: WorkExperience = {
          id: newId,
          ...workExpData
        };
        
        updatedExperience = [...profileData.workExperience, newEntry];
        toast.success("Work experience added");
      }
      
      // Update profile data state with new work experience
      setProfileData(prev => ({
        ...prev,
        workExperience: updatedExperience,
        profileComplete: calculateProfileCompletion({ ...prev, workExperience: updatedExperience })
      }));
      
      setIsWorkModalOpen(false);
    } catch (error) {
      console.error("[Profile.tsx] saveWorkExperience: Error saving work experience:", error);
      toast.error("Failed to save work experience. Check console for details.");
    }
  };

  const deleteWorkExperienceHandler = async (idToDelete: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete work experience");
      return;
    }
    
    try {
      console.log(`[Profile.tsx] deleteWorkExperienceHandler: Deleting work experience with ID: ${idToDelete}`);
      await deleteWorkExperienceFromUserDoc(currentUser.uid, idToDelete);
      console.log(`[Profile.tsx] deleteWorkExperienceHandler: Successfully deleted work experience`);
      
      // Update local state
      const updatedExperience = profileData.workExperience.filter(exp => exp.id !== idToDelete);
      setProfileData(prev => ({
        ...prev,
        workExperience: updatedExperience,
        profileComplete: calculateProfileCompletion({ ...prev, workExperience: updatedExperience })
      }));
      
      toast.info("Work experience deleted");
    } catch (error) {
      console.error(`[Profile.tsx] deleteWorkExperienceHandler: Error deleting work experience:`, error);
      toast.error("Failed to delete work experience. Check console for details.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate('/signin');
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    }
  };

  // Inside the Profile component, add this function
  const resetProfile = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      await initializeUserProfile(currentUser);
      toast.success("Profile has been reset");
      
      // Reload profile data
      const data = await getProfileData(currentUser.uid);
      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error("Error resetting profile:", error);
      toast.error("Failed to reset profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to handle resume updates
  const toggleEditResume = () => {
    setIsEditingResume(!isEditingResume);
    
    // If we're turning off editing, save the changes
    if (isEditingResume && currentUser) {
      saveResumeData();
    }
  };

  // Function to save resume data
  const saveResumeData = async () => {
    if (!currentUser) return;
    
    try {
      // Only save if we have at least a URL
      if (resumeData.url) {
        // Store resume data as JSON string in the resume field
        const resumeString = JSON.stringify(resumeData);
        
        await saveProfileData(currentUser.uid, {
          ...profileData,
          resume: resumeString
        });
        
        // Update the profile data state
        setProfileData(prev => ({
          ...prev,
          resume: resumeString
        }));
        
        toast.success("Resume updated");
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast.error("Failed to save resume");
    }
  };

  // Handle resume input changes
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Links Functions ---
  const openAddLinkModal = () => {
    setCurrentLink({});
    setEditingLinkIndex(null);
    setIsLinkModalOpen(true);
  };

  const openEditLinkModal = (link: ProfileLink, index: number) => {
    setCurrentLink({ ...link, id: link.id }); // Ensure ID is included
    setEditingLinkIndex(index);
    setIsLinkModalOpen(true);
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentLink(prev => ({ ...prev, [name]: value }));
  };

  const saveLink = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to save links");
      return;
    }
    
    if (!currentLink.url || !currentLink.title) {
      toast.error("Please provide both a Title and a URL for the link.");
      return;
    }

    const linkDataToSave = {
      title: currentLink.title || '',
      url: currentLink.url || '',
      type: currentLink.type || 'website' // Default type
    };
    console.log(`[Profile.tsx] saveLink: Attempting to save link:`, { isEditing: editingLinkIndex !== null, id: currentLink.id, data: linkDataToSave });

    try {
      let updatedLinks: ProfileLink[];
      
      if (editingLinkIndex !== null && currentLink.id) {
        // Editing existing link
        console.log(`[Profile.tsx] saveLink: Calling updateLinkInUserDoc for ID: ${currentLink.id}`);
        await updateLinkInUserDoc(currentUser.uid, currentLink.id, linkDataToSave);
        console.log(`[Profile.tsx] saveLink: Successfully updated link`);
        updatedLinks = profileData.links.map((item, idx) => 
          idx === editingLinkIndex ? { ...item, ...linkDataToSave, id: item.id } : item
        );
        toast.success("Link updated");
      } else {
        // Adding new link
        console.log(`[Profile.tsx] saveLink: Calling addLinkToUserDoc`);
        const newId = await addLinkToUserDoc(currentUser.uid, linkDataToSave);
        console.log(`[Profile.tsx] saveLink: Successfully added link, new ID: ${newId}`);
        const newLink: ProfileLink = {
          id: newId,
          ...linkDataToSave
        };
        updatedLinks = [...profileData.links, newLink];
        toast.success("Link added");
      }
      
      setProfileData(prev => ({
        ...prev,
        links: updatedLinks
      }));
      
      setIsLinkModalOpen(false);
    } catch (error) {
      console.error("[Profile.tsx] saveLink: Error during save/update:", error);
      toast.error("Failed to save link. Check console.");
    }
  };

  const deleteLinkHandler = async (linkId: string) => {
    if (!currentUser) {
      toast.error("You must be logged in to delete links");
      return;
    }
    
    try {
      // Use the new function that deletes directly from the user document
      await deleteLinkFromUserDoc(currentUser.uid, linkId);
      
      // Update local state
      const updatedLinks = profileData.links.filter(link => link.id !== linkId);
      setProfileData(prev => ({
        ...prev,
        links: updatedLinks
      }));
      
      toast.info("Link deleted");
    } catch (error) {
      console.error(`[Profile.tsx] deleteLinkHandler: Error deleting link ${linkId}:`, error);
      toast.error("Failed to delete link. Check console.");
    }
  };

  // Education handlers
  const openAddEducationModal = () => {
    setCurrentEducation({});
    setEditingEducationIndex(null);
    setIsEducationModalOpen(true);
  };

  const openEditEducationModal = (education: Education, index: number) => {
    setCurrentEducation({...education, index});
    setEditingEducationIndex(index);
    setIsEducationModalOpen(true);
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentEducation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEducation = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Validate required fields
      if (!currentEducation.institution || !currentEducation.degree || !currentEducation.period) {
        toast.error("Please fill out all required fields");
        return;
      }
      
      const updatedEducation = [...profileData.education];
      
      if (editingEducationIndex !== null && currentEducation.id) {
        // Update existing education
        await updateEducationInUserDoc(userId, currentEducation.id, currentEducation);
        
        // Update local state
        updatedEducation[editingEducationIndex] = {
          id: currentEducation.id,
          institution: currentEducation.institution || '',
          degree: currentEducation.degree || '',
          period: currentEducation.period || '',
          gpa: currentEducation.gpa || ''
        };
        
        toast.success("Education updated successfully");
      } else {
        // Add new education
        const educationId = await addEducationToUserDoc(userId, {
          institution: currentEducation.institution || '',
          degree: currentEducation.degree || '',
          period: currentEducation.period || '',
          gpa: currentEducation.gpa || ''
        });
        
        // Add to local state
        updatedEducation.push({
          id: educationId,
          institution: currentEducation.institution || '',
          degree: currentEducation.degree || '',
          period: currentEducation.period || '',
          gpa: currentEducation.gpa || ''
        });
        
        toast.success("Education added successfully");
      }
      
      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        education: updatedEducation
      }));
      
      // Reset and close modal
      setCurrentEducation({});
      setEditingEducationIndex(null);
      setIsEducationModalOpen(false);
    } catch (error) {
      console.error("Error saving education:", error);
      toast.error("Failed to save education");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEducation = async (educationId: string, index: number) => {
    if (!currentUser || !educationId) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Delete from Firebase
      await deleteEducationFromUserDoc(userId, educationId);
      
      // Update local state by removing the education at the specified index
      const updatedEducation = [...profileData.education];
      updatedEducation.splice(index, 1);
      
      setProfileData(prev => ({
        ...prev,
        education: updatedEducation
      }));
      
      toast.success("Education deleted successfully");
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education");
    } finally {
      setIsLoading(false);
    }
  };

  // Certification handlers
  const openAddCertificationModal = () => {
    setCurrentCertification({});
    setEditingCertificationIndex(null);
    setIsCertificationModalOpen(true);
  };

  const openEditCertificationModal = (certification: Certification, index: number) => {
    setCurrentCertification({...certification, index});
    setEditingCertificationIndex(index);
    setIsCertificationModalOpen(true);
  };

  const handleCertificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentCertification(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveCertification = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Validate required fields
      if (!currentCertification.name) {
        toast.error("Please provide a name for the certification");
        setIsLoading(false);
        return;
      }
      
      const updatedCertifications = [...(profileData.certifications || [])];
      
      if (editingCertificationIndex !== null && currentCertification.id) {
        // Update existing certification
        await updateCertificationInUserDoc(userId, currentCertification.id, currentCertification);
        
        // Update local state
        updatedCertifications[editingCertificationIndex] = {
          id: currentCertification.id,
          name: currentCertification.name || '',
          date: currentCertification.date || '',
          link: currentCertification.link || ''
        };
        
        toast.success("Certification updated successfully");
      } else {
        // Add new certification
        const certificationId = await addCertificationToUserDoc(userId, {
          name: currentCertification.name || '',
          date: currentCertification.date || '',
          link: currentCertification.link || ''
        });
        
        // Add to local state
        updatedCertifications.push({
          id: certificationId,
          name: currentCertification.name || '',
          date: currentCertification.date || '',
          link: currentCertification.link || ''
        });
        
        toast.success("Certification added successfully");
      }
      
      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        certifications: updatedCertifications
      }));
      
      // Reset and close modal
      setCurrentCertification({});
      setEditingCertificationIndex(null);
      setIsCertificationModalOpen(false);
    } catch (error) {
      console.error("Error saving certification:", error);
      toast.error("Failed to save certification");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCertification = async (certificationId: string, index: number) => {
    if (!currentUser || !certificationId) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Delete from Firebase
      await deleteCertificationFromUserDoc(userId, certificationId);
      
      // Update local state by removing the certification at the specified index
      const updatedCertifications = [...(profileData.certifications || [])];
      updatedCertifications.splice(index, 1);
      
      setProfileData(prev => ({
        ...prev,
        certifications: updatedCertifications
      }));
      
      toast.success("Certification deleted successfully");
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast.error("Failed to delete certification");
    } finally {
      setIsLoading(false);
    }
  };

  // Badge handlers
  const openAddBadgeModal = () => {
    setCurrentBadge({});
    setEditingBadgeIndex(null);
    setIsBadgeModalOpen(true);
  };

  const openEditBadgeModal = (badge: BadgeType, index: number) => {
    setCurrentBadge({...badge, index});
    setEditingBadgeIndex(index);
    setIsBadgeModalOpen(true);
  };

  const handleBadgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentBadge(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveBadge = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Validate required fields
      if (!currentBadge.imageUrl) {
        toast.error("Please provide an image URL for the badge");
        setIsLoading(false);
        return;
      }
      
      const updatedBadges = [...(profileData.badges || [])];
      
      if (editingBadgeIndex !== null && currentBadge.id) {
        // Update existing badge
        await updateBadgeInUserDoc(userId, currentBadge.id, {
          imageUrl: currentBadge.imageUrl,
          name: currentBadge.name
        });
        
        // Update local state
        updatedBadges[editingBadgeIndex] = {
          id: currentBadge.id,
          imageUrl: currentBadge.imageUrl || '',
          name: currentBadge.name
        };
        
        toast.success("Badge updated successfully");
      } else {
        // Add new badge
        const badgeId = await addBadgeToUserDoc(userId, {
          imageUrl: currentBadge.imageUrl || '',
          name: currentBadge.name
        });
        
        // Add to local state
        updatedBadges.push({
          id: badgeId,
          imageUrl: currentBadge.imageUrl || '',
          name: currentBadge.name
        });
        
        toast.success("Badge added successfully");
      }
      
      // Update profile data state
      setProfileData(prev => ({
        ...prev,
        badges: updatedBadges
      }));
      
      // Reset and close modal
      setCurrentBadge({});
      setEditingBadgeIndex(null);
      setIsBadgeModalOpen(false);
    } catch (error) {
      console.error("Error saving badge:", error);
      toast.error("Failed to save badge");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBadge = async (badgeId: string, index: number) => {
    if (!currentUser || !badgeId) return;
    
    try {
      setIsLoading(true);
      const userId = currentUser.uid;
      
      // Delete from Firebase
      await deleteBadgeFromUserDoc(userId, badgeId);
      
      // Update local state by removing the badge at the specified index
      const updatedBadges = [...(profileData.badges || [])];
      updatedBadges.splice(index, 1);
      
      setProfileData(prev => ({
        ...prev,
        badges: updatedBadges
      }));
      
      toast.success("Badge deleted successfully");
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast.error("Failed to delete badge");
    } finally {
      setIsLoading(false);
    }
  };

  // Add an openAddSkillModal function with the other modal functions
  const openAddSkillModal = () => {
    setNewSkill('');
    setIsSkillModalOpen(true);
  };

  if (isLoading) {
    return <div className="animate-pulse flex justify-center items-center min-h-[80vh]">
      <p>Loading profile...</p>
    </div>;
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
      {/* Left column - User info and personal details */}
      <div className="lg:col-span-1 space-y-8">
        {/* Profile Card */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-black hover:text-black/80 hover:bg-black/5"
          >
            <Edit size={18} />
          </Button>
          <div className="flex flex-col items-center mb-4">
            <Avatar className="h-28 w-28 mb-5 border-4 border-[#f0bfdc]/30">
              <AvatarImage src={currentUser?.photoURL || ""} />
              <AvatarFallback className="text-3xl bg-[#f0bfdc] text-white">
                {(profileData.name || currentUser?.displayName || 'U').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-light">{profileData.name || currentUser?.displayName || 'User Name'}</h1>
            <p className="text-muted-foreground">{profileData.username || ('@' + (currentUser?.displayName || 'username').replace(/\s+/g, '').toLowerCase())}</p>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <UserIcon className="text-black" size={22} />
            <h2 className="text-xl font-light">Personal Information</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-black hover:text-black/80 hover:bg-black/5"
              onClick={toggleEditPersonalInfo}
            >
              {isEditingPersonalInfo ? <Save size={18} /> : <Edit size={18} />}
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Mail className="text-black" size={18} />
              <span>{currentUser?.email || profileData.email || 'No email available'}</span>
            </div>
            
              <div className="flex items-center gap-3">
              <Phone className="text-black mt-1 self-start" size={18} />
              {isEditingPersonalInfo ? (
                <Input 
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  placeholder="Add your mobile number"
                  className="h-9 bg-white/80 border-black/10"
                />
              ) : (
                profileData.phone ? (
                  <span>{profileData.phone}</span>
                ) : (
                  <span className="text-muted-foreground italic">Add your mobile number</span>
                )
              )}
              </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="text-black mt-1 self-start" size={18} />
              {isEditingPersonalInfo ? (
                <Input 
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  placeholder="Your location (e.g., City, Country)"
                  className="h-9 bg-white/80 border-black/10"
                />
              ) : (
                profileData.location ? (
                  <span>{profileData.location}</span>
                ) : (
                   <span className="text-muted-foreground italic">Add your location</span>
                )
              )}
            </div>
          </div>
        </Card>

        {/* Resume */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="text-black" size={22} />
            <h2 className="text-xl font-light">My Resume</h2>
            <div className="flex gap-2 ml-auto">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-black hover:text-black/80 hover:bg-black/5"
                onClick={toggleEditResume}
              >
                {isEditingResume ? <Save size={18} /> : <Pencil size={18} />}
              </Button>
              {resumeData.url && !isEditingResume && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-black hover:text-black/80 hover:bg-black/5"
                  onClick={() => {
                    setResumeData({ name: '', url: '' });
                    saveResumeData();
                  }}
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {isEditingResume ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="resumeName">Resume Name</Label>
                <Input 
                  id="resumeName"
                  name="name"
                  value={resumeData.name}
                  onChange={handleResumeChange}
                  placeholder="My Resume"
                  className="mt-1 bg-white/80 border-black/10"
                />
              </div>
              <div>
                <Label htmlFor="resumeUrl">Resume URL</Label>
                <Input 
                  id="resumeUrl"
                  name="url"
                  value={resumeData.url}
                  onChange={handleResumeChange}
                  placeholder="https://example.com/my-resume.pdf"
                  className="mt-1 bg-white/80 border-black/10"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-black">
              <FileText size={18} />
              {resumeData.url ? (
                <a 
                  href={resumeData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-black/80 transition-colors"
                >
                  {resumeData.name || 'My Resume'}
                </a>
              ) : (
                <span className="text-muted-foreground italic">Add resume link/file</span>
              )}
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <Edit className="text-black" size={22} />
            <h2 className="text-xl font-light">EEO settings</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-black hover:text-black/80 hover:bg-black/5"
            >
              <Edit size={18} />
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          <p className="text-sm text-muted-foreground">
            Manage detailed settings like notifications, privacy, and security.
          </p>
          <Button 
            variant="outline" 
            className="mt-4 w-full border-black/20 text-black/80 hover:bg-black/5"
            onClick={() => navigate('/dashboard/settings')}
          >
            Go to Settings
          </Button>
        </Card>

        {/* Logout Button */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </Card>
      </div>

      {/* Right column - Profile completion, badges, certifications, etc */}
      <div className="lg:col-span-2 space-y-8">
        {/* Badges */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <Award className="text-black" size={22} />
            <h2 className="text-xl font-light">My Badges</h2>
            <Button 
              onClick={openAddBadgeModal}
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Add Badge
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {profileData.badges && profileData.badges.length > 0 ? (
            <div className="flex flex-wrap gap-6">
              {profileData.badges.map((badge, index) => (
                <div key={badge.id} className="relative group">
                  <div className="flex flex-col items-center">
                    <div className="h-28 w-28 bg-white/50 rounded-full p-2 flex items-center justify-center mb-3 shadow-sm">
                      <div className="h-24 w-24 rounded-full flex items-center justify-center overflow-hidden border-2 border-black/30">
                        <img 
                          src={badge.imageUrl} 
                          alt={badge.name || "Badge"} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Badge';
                          }}
                        />
                      </div>
                    </div>
                    {badge.name && <span className="text-sm font-medium">{badge.name}</span>}
                  </div>
                  
                  {/* Edit/Delete buttons that appear on hover */}
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white border-none shadow-md text-black hover:text-black/80 hover:bg-white"
                      onClick={() => openEditBadgeModal(badge, index)}
                    >
                      <Pencil size={12} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-6 w-6 rounded-full bg-white border-none shadow-md text-red-400 hover:text-red-600 hover:bg-white"
                      onClick={() => deleteBadge(badge.id, index)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-between items-center p-4 bg-white/50 rounded-lg">
              <p className="text-muted-foreground">You have not added any badges yet.</p>
            </div>
          )}
        </Card>

        {/* Certifications */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <FileText className="text-black" size={22} />
            <h2 className="text-xl font-light">My Certifications</h2>
            <Button 
              onClick={openAddCertificationModal}
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Add Certification
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {profileData.certifications && profileData.certifications.length > 0 ? (
            <div className="space-y-4">
              {profileData.certifications.map((cert, index) => (
                <div key={cert.id}>
                  <div className="p-4 rounded-lg relative group flex items-start gap-4">
                    {/* Certificate thumbnail preview */}
                    {cert.link && (
                      <div 
                        className="w-32 aspect-video flex-shrink-0 rounded overflow-hidden cursor-pointer border border-black/40"
                        onClick={() => setPreviewCertificate(cert)}
                      >
                        <img 
                          src={cert.link}
                          alt={cert.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Certificate';
                          }}
                        />
                      </div>
                    )}
                    {/* Certificate info */}
                    <div className="flex-grow">
                      <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditCertificationModal(cert, index)}
                          className="h-7 w-7 text-black hover:text-black/80 hover:bg-black/5"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteCertification(cert.id, index)}
                          className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                      <h3 className="font-medium text-lg">{cert.name}</h3>
                      {cert.date && <p className="text-sm text-black/70">Date: {cert.date}</p>}
                      {cert.link && (
                        <a 
                          href={cert.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-black hover:underline mt-1 inline-block"
                        >
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                  {index < profileData.certifications.length - 1 && <Separator className="my-4 bg-black/10" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg">
              <p className="text-muted-foreground">You have not added any certificates yet.</p>
            </div>
          )}
        </Card>

        {/* Work Experience Section - Now with Add/Edit/Delete (Modal to be added) */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <Briefcase className="text-black" size={22} />
            <h2 className="text-xl font-light">Work Experience</h2>
            <Button 
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
              onClick={openAddWorkModal}
            >
              <Plus size={14} /> Add Work
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {profileData.workExperience && profileData.workExperience.length > 0 ? (
            profileData.workExperience.map((job, index) => (
              <div key={job.id}>
                <div className="mb-4 relative group rounded-lg p-4">
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-black hover:text-black/80 hover:bg-black/5"
                      onClick={() => openEditWorkModal(job, index)}
                    >
                      <Pencil size={14} />
                    </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                      onClick={() => deleteWorkExperienceHandler(job.id)}
                >
                      <Trash2 size={14} />
                </Button>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Briefcase size={24} className="text-black/30" />
                  </div>
                  <div>
                      <h3 className="font-medium text-base">{job.role}</h3>
                      <p className="text-sm text-black/70">{job.company} • {job.period}</p>
                      {job.location && <p className="text-xs text-muted-foreground">{job.location}</p>}
                      {job.description && <p className="text-xs text-black/60 mt-1 pr-10">{job.description}</p>}
                    </div>
                  </div>
                </div>
                {index < profileData.workExperience.length - 1 && <Separator className="mb-4 bg-black/10" />}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic rounded-lg p-4">No work experience added yet.</p>
          )}
        </Card>
        
        {/* Modal for Work Experience (Conceptual - actual component to be added) */}
        {isWorkModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">{editingWorkIndex !== null ? 'Edit' : 'Add'} Work Experience</h3>
              <div className="space-y-3">
                <Input name="role" value={currentWorkExperience.role || ''} onChange={handleWorkExperienceChange} placeholder="Role (e.g., Software Engineer)" />
                <Input name="company" value={currentWorkExperience.company || ''} onChange={handleWorkExperienceChange} placeholder="Company" />
                <Input name="period" value={currentWorkExperience.period || ''} onChange={handleWorkExperienceChange} placeholder="Period (e.g., Jan 2023 - Present)" />
                <Input name="location" value={currentWorkExperience.location || ''} onChange={handleWorkExperienceChange} placeholder="Location (e.g., Remote or City, Country)" />
                <textarea 
                  name="description" 
                  value={currentWorkExperience.description || ''} 
                  onChange={handleWorkExperienceChange} 
                  placeholder="Description (Optional)"
                  className="w-full p-2 border rounded-md min-h-[80px] text-sm bg-white border-gray-300 focus:border-gray-500"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsWorkModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={saveWorkExperience}>Save</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Education */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <BookOpen className="text-black" size={22} />
            <h2 className="text-xl font-light">Education</h2>
            <Button 
              onClick={openAddEducationModal}
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Add Education
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {profileData.education && profileData.education.length > 0 ? (
            profileData.education.map((edu, index) => (
              <div key={edu.id}>
                <div className="mb-4 relative rounded-lg p-4">
                  <div className="absolute right-3 top-3 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openEditEducationModal(edu, index)}
                      className="text-black hover:text-black/80 hover:bg-black/5"
                    >
                      <Edit size={18} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteEducation(edu.id, index)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-xs text-black/50">INST</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{edu.institution}</h3>
                      <p className="text-sm text-black/70">{edu.degree} • {edu.period} • CGPA: {edu.gpa}</p>
                    </div>
                  </div>
                </div>
                {index < profileData.education.length - 1 && <Separator className="mb-4 bg-black/10" />}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground italic rounded-lg p-4">No education added yet.</p>
          )}
        </Card>

        {/* Links Section */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <LinkIcon className="text-black" size={22} />
            <h2 className="text-xl font-light">Links</h2>
            <Button 
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
              onClick={openAddLinkModal}
            >
              <Plus size={14} /> Add Link
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          {profileData.links && profileData.links.length > 0 ? (
            <div className="space-y-4">
              {profileData.links.map((link, index) => (
                <div key={link.id}>
                  <div className="relative group flex items-center justify-between p-3 rounded-lg">
                    <div>
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-black hover:underline"
                      >
                        {link.title}
                      </a>
                      <p className="text-xs text-gray-500 truncate max-w-xs">
                        {link.type || 'website'}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-black hover:text-black/80 hover:bg-black/5"
                        onClick={() => openEditLinkModal(link, index)}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                        onClick={() => deleteLinkHandler(link.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                  {index < profileData.links.length - 1 && <Separator className="my-3 bg-black/10" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-lg">
              <p className="text-muted-foreground italic">
                No links added yet. Add relevant links like your portfolio, GitHub, or LinkedIn.
              </p>
            </div>
          )}
        </Card>

        {/* Skills */}
        <Card className="p-6 relative bg-[#eee7da] border border-black/40 rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-5">
            <Award className="text-black" size={22} />
            <h2 className="text-xl font-light">My Skills</h2>
            <Button 
              onClick={openAddSkillModal}
              className="ml-auto bg-black text-white hover:bg-black/80 hover:outline hover:outline-black hover:outline-1 rounded-md px-4 py-2 h-auto text-xs flex items-center gap-1"
            >
              <Plus size={14} /> Add Skill
            </Button>
          </div>
          <Separator className="my-5 bg-black/10" />
          
          <div className="flex flex-wrap gap-2 mb-4">
            {profileData.skills && profileData.skills.length > 0 ? (
              profileData.skills.map((skill, index) => (
              <Badge 
                key={index} 
                  className="bg-white py-1 pl-3 pr-1 shadow-sm text-black/80 hover:bg-white/80 group relative"
              >
                {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1.5 p-0.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-black/10 transition-opacity"
                    aria-label={`Remove ${skill}`}
                  >
                     <X size={12} className="text-black/60"/>
                  </button>
              </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic w-full">No skills added yet.</p>
            )}
          </div>
        </Card>

        {/* Links Modal */}
        {isLinkModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">{editingLinkIndex !== null ? 'Edit' : 'Add'} Link</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="linkTitle">Title</Label>
                  <Input 
                    id="linkTitle"
                    name="title" 
                    value={currentLink.title || ''} 
                    onChange={handleLinkChange} 
                    placeholder="e.g., Portfolio, GitHub"
                    className="mt-1"
                   />
                </div>
                <div>
                  <Label htmlFor="linkUrl">URL</Label>
                  <Input 
                    id="linkUrl"
                    name="url" 
                    value={currentLink.url || ''} 
                    onChange={handleLinkChange} 
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsLinkModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={saveLink}>Save Link</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Education Modal */}
        {isEducationModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">{editingEducationIndex !== null ? 'Edit' : 'Add'} Education</h3>
              <div className="space-y-3">
                <Input name="institution" value={currentEducation.institution || ''} onChange={handleEducationChange} placeholder="Institution (e.g., Stanford University)" />
                <Input name="degree" value={currentEducation.degree || ''} onChange={handleEducationChange} placeholder="Degree (e.g., B.S. Computer Science)" />
                <Input name="period" value={currentEducation.period || ''} onChange={handleEducationChange} placeholder="Period (e.g., 2019 - 2023)" />
                <Input name="gpa" value={currentEducation.gpa || ''} onChange={handleEducationChange} placeholder="GPA (e.g., 3.8)" />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEducationModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={saveEducation}>Save</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Certification Modal */}
        {isCertificationModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">{editingCertificationIndex !== null ? 'Edit' : 'Add'} Certification</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="certName">Certification Name</Label>
                  <Input 
                    id="certName"
                    name="name" 
                    value={currentCertification.name || ''} 
                    onChange={handleCertificationChange} 
                    placeholder="e.g., AWS Certified Solutions Architect"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="certDate">Date Obtained</Label>
                  <Input 
                    id="certDate"
                    name="date" 
                    value={currentCertification.date || ''} 
                    onChange={handleCertificationChange} 
                    placeholder="e.g., January 2023"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="certLink">Certificate Link (Optional)</Label>
                  <Input 
                    id="certLink"
                    name="link" 
                    value={currentCertification.link || ''} 
                    onChange={handleCertificationChange} 
                    placeholder="e.g., https://example.com/certification"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCertificationModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={saveCertification}>Save</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Badge Modal */}
        {isBadgeModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">{editingBadgeIndex !== null ? 'Edit' : 'Add'} Badge</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="badgeImageUrl">Badge Image URL</Label>
                  <Input 
                    id="badgeImageUrl"
                    name="imageUrl" 
                    value={currentBadge.imageUrl || ''} 
                    onChange={handleBadgeChange} 
                    placeholder="https://example.com/badge.png"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="badgeName">Badge Name (Optional)</Label>
                  <Input 
                    id="badgeName"
                    name="name" 
                    value={currentBadge.name || ''} 
                    onChange={handleBadgeChange} 
                    placeholder="e.g., Advanced JavaScript"
                    className="mt-1"
                  />
                </div>
                
                {/* Preview */}
                {currentBadge.imageUrl && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="flex justify-center mt-2">
                      <div className="h-20 w-20 bg-white/50 rounded-full p-1 flex items-center justify-center shadow-sm">
                        <div className="h-full w-full rounded-full flex items-center justify-center overflow-hidden border-2 border-[#f0bfdc]/30">
                          <img 
                            src={currentBadge.imageUrl} 
                            alt={currentBadge.name || "Badge"} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error';
                              toast.error("Failed to load image from URL");
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBadgeModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={saveBadge}>Save Badge</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Skills Modal */}
        {isSkillModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-scale">
              <h3 className="text-lg font-medium mb-4">Add Skill</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skillName">Skill Name</Label>
                  <Input 
                    id="skillName"
                    name="newSkill"
                    value={newSkill}
                    onChange={handleInputChange}
                    placeholder="e.g., React, JavaScript, Project Management"
                    className="mt-1"
                    onKeyDown={(e) => e.key === 'Enter' && addSkillHandler()}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSkillModalOpen(false)}>Cancel</Button>
                <Button className="bg-black text-white" onClick={addSkillHandler}>Add Skill</Button>
              </div>
            </Card>
          </div>
        )}

        {/* Certificate Preview Modal */}
        {previewCertificate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl animate-fade-in-scale">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-medium">{previewCertificate.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setPreviewCertificate(null)}>
                  <X size={20} />
                </Button>
              </div>
              <div className="flex flex-col items-center rounded-lg overflow-hidden border border-[#f0bfdc]/20">
                <img 
                  src={previewCertificate.link}
                  alt={previewCertificate.name}
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Unable+to+load+certificate';
                  }}
                />
              </div>
              {previewCertificate.date && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Issued: {previewCertificate.date}
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProfileWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Profile />
    </ErrorBoundary>
  );
}
