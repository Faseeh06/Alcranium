import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  User,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  DocumentData,
  setDoc,
  limit,
  getDoc
} from "firebase/firestore";
import { Task, TaskPriority, StudySession } from "@/data/mock-data";
import { format } from "date-fns";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyK56hEY9PdMaLJvAbTfh7d8ryCy41CJY",
  authDomain: "alcranium.firebaseapp.com",
  projectId: "alcranium",
  storageBucket: "alcranium.firebasestorage.app",
  messagingSenderId: "568899109251",
  appId: "1:568899109251:web:57eccce38c2df0f3fe76b6",
  measurementId: "G-15Z2S92253"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Enable persistence for auth state
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Error setting auth persistence:", error);
  });

// Authentication helpers
export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update the user profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
      
      // Initialize user document in Firestore with proper structure
      await initializeUserProfile(userCredential.user, displayName);
    }
    return userCredential.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if this is a new user and create Firestore document if needed
    // For Google sign-in, we need to check if the user already exists in Firestore
    const userRef = doc(db, "users", result.user.uid);
    const userDoc = await getDoc(userRef);
    const isNewUser = !userDoc.exists();
    
    if (isNewUser && result.user) {
      await initializeUserProfile(result.user);
    }
    
    return result.user;
  } catch (error) {
    console.error("Google login error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore collection references
export const usersCollection = collection(db, "users");
export const tasksCollection = collection(db, "tasks");
export const sessionsCollection = collection(db, "sessions");

// Ensure collections exist by creating a dummy document if needed
// This is only needed for development/testing
export const ensureCollectionsExist = async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      // For tasks collection
      const tasksQuery = query(tasksCollection, limit(1));
      const tasksSnapshot = await getDocs(tasksQuery);
      if (tasksSnapshot.empty) {
        // Create a dummy document to ensure collection exists
        const dummyTaskRef = doc(tasksCollection, "dummy-init");
        await setDoc(dummyTaskRef, { 
          isDummy: true, // Using a valid field name instead of __dummy__
          title: "Dummy Task", 
          description: "This is a dummy task to initialize the collection",
          createdAt: Timestamp.now()
        });
        console.log("Tasks collection initialized");
      }
      
      // For sessions collection
      const sessionsQuery = query(sessionsCollection, limit(1));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      if (sessionsSnapshot.empty) {
        // Create a dummy document to ensure collection exists
        const dummySessionRef = doc(sessionsCollection, "dummy-init");
        await setDoc(dummySessionRef, { 
          isDummy: true,
          title: "Dummy Session", 
          subject: "Test",
          createdAt: Timestamp.now()
        });
        console.log("Sessions collection initialized");
      }
    } catch (error) {
      console.error("Error ensuring collections exist:", error);
    }
  }
};

// Task helpers
export const getUserTasks = async (userId: string): Promise<Task[]> => {
  if (!userId) {
    console.error("No user ID provided to getUserTasks");
    return [];
  }
  
  try {
    console.log("Querying tasks for userId:", userId); // Debug log
    
    // First try with the full query including sorting
    try {
      const q = query(
        tasksCollection,
        where("userId", "==", userId),
        orderBy("dueDate", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const tasks: Task[] = [];
      
      console.log("Query returned documents:", querySnapshot.size); // Debug log
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDummy) { // Skip dummy documents
          tasks.push({
            id: doc.id,
            title: data.title,
            description: data.description || "",
            completed: Boolean(data.completed),
            priority: data.priority as TaskPriority || "medium",
            dueDate: data.dueDate || format(new Date(), 'yyyy-MM-dd'),
            category: data.category || ""
          });
        }
      });
      
      console.log("Parsed tasks:", tasks); // Debug log
      return tasks;
    } catch (error) {
      // If we get an index error, try without ordering as a fallback
      if (error instanceof Error && 
          error.message.includes("requires an index")) {
        console.warn("Index not created yet, fetching without ordering");
        
        // Fallback query without ordering
        const fallbackQuery = query(
          tasksCollection,
          where("userId", "==", userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackTasks: Task[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isDummy) {
            fallbackTasks.push({
              id: doc.id,
              title: data.title,
              description: data.description || "",
              completed: Boolean(data.completed),
              priority: data.priority as TaskPriority || "medium",
              dueDate: data.dueDate || format(new Date(), 'yyyy-MM-dd'),
              category: data.category || ""
            });
          }
        });
        
        // Sort the tasks manually on the client side
        fallbackTasks.sort((a, b) => {
          const dateA = new Date(a.dueDate).getTime();
          const dateB = new Date(b.dueDate).getTime();
          return dateA - dateB;
        });
        
        console.log("Fallback query returned tasks:", fallbackTasks.length);
        return fallbackTasks;
      }
      
      // Throw other errors
      throw error;
    }
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
};

export const addTask = async (taskData: Omit<Task, 'id'> & { userId: string }): Promise<string> => {
  if (!taskData.userId) {
    throw new Error("User ID is required to add a task");
  }
  
  try {
    console.log("Adding task with data:", taskData); // Debug log
    
    // Ensure all fields have values to prevent Firestore issues
    const taskWithDefaults = {
      ...taskData,
      description: taskData.description || "",
      completed: Boolean(taskData.completed),
      priority: taskData.priority || "medium",
      category: taskData.category || "",
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(tasksCollection, taskWithDefaults);
    console.log("Task added with ID:", docRef.id); // Debug log
    return docRef.id;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  if (!taskId) {
    throw new Error("Task ID is required for updates");
  }
  
  try {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  if (!taskId) {
    throw new Error("Task ID is required for deletion");
  }
  
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// Study Session helpers
// Interface for a Firebase study session
interface FirebaseStudySession {
  id?: string;
  title: string;
  subject: string;
  startTimestamp: Timestamp;
  endTimestamp: Timestamp;
  durationMinutes: number;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Convert Firestore session to app StudySession
const convertToStudySession = (doc: {id: string, data: () => Record<string, unknown>}): StudySession => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title as string || "",
    subject: data.subject as string || "",
    start: (data.startTimestamp as Timestamp)?.toDate() || new Date(),
    end: (data.endTimestamp as Timestamp)?.toDate() || new Date(),
    durationMinutes: data.durationMinutes as number || 0
  };
};

// Helper to prepare session data for Firestore
const prepareSessionData = (session: Partial<StudySession> & { userId: string }): FirebaseStudySession => {
  const startDate = session.start instanceof Date ? session.start : new Date(session.start || Date.now());
  const endDate = session.end instanceof Date ? session.end : (
    session.start instanceof Date && session.durationMinutes 
      ? new Date(session.start.getTime() + session.durationMinutes * 60000)
      : new Date(startDate.getTime() + (session.durationMinutes || 60) * 60000)
  );
  
  return {
    title: session.title || "Untitled Session",
    subject: session.subject || "",
    startTimestamp: Timestamp.fromDate(startDate),
    endTimestamp: Timestamp.fromDate(endDate),
    durationMinutes: session.durationMinutes || 
      Math.round((endDate.getTime() - startDate.getTime()) / 60000),
    userId: session.userId,
    createdAt: Timestamp.now()
  };
};

// Get all study sessions for a user
export const getUserSessions = async (userId: string): Promise<StudySession[]> => {
  if (!userId) {
    console.error("No user ID provided to getUserSessions");
    return [];
  }
  
  try {
    console.log("Querying sessions for userId:", userId);
    
    // Try with ordering by start time
    try {
      const q = query(
        sessionsCollection,
        where("userId", "==", userId),
        orderBy("startTimestamp", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const sessions: StudySession[] = [];
      
      console.log("Session query returned documents:", querySnapshot.size);
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isDummy) {
          sessions.push(convertToStudySession({id: doc.id, data: () => data}));
        }
      });
      
      return sessions;
    } catch (error) {
      // Fallback without ordering if index isn't created
      if (error instanceof Error && error.message.includes("requires an index")) {
        console.warn("Index not created yet for sessions, fetching without ordering");
        
        const fallbackQuery = query(
          sessionsCollection,
          where("userId", "==", userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackSessions: StudySession[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.isDummy) {
            fallbackSessions.push(convertToStudySession({id: doc.id, data: () => data}));
          }
        });
        
        // Sort manually
        fallbackSessions.sort((a, b) => a.start.getTime() - b.start.getTime());
        
        console.log("Fallback session query returned:", fallbackSessions.length);
        return fallbackSessions;
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error getting sessions:", error);
    throw error;
  }
};

// Add a new study session
export const addSession = async (sessionData: Partial<StudySession> & { userId: string }): Promise<string> => {
  if (!sessionData.userId) {
    throw new Error("User ID is required to add a session");
  }
  
  try {
    console.log("Adding session with data:", sessionData);
    
    const sessionWithDefaults = prepareSessionData(sessionData);
    
    const docRef = await addDoc(sessionsCollection, sessionWithDefaults);
    console.log("Session added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding session:", error);
    throw error;
  }
};

// Update an existing study session
export const updateSession = async (sessionId: string, updates: Partial<StudySession>): Promise<void> => {
  if (!sessionId) {
    throw new Error("Session ID is required for updates");
  }
  
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now()
    };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subject !== undefined) updateData.subject = updates.subject;
    
    if (updates.start) {
      updateData.startTimestamp = Timestamp.fromDate(
        updates.start instanceof Date ? updates.start : new Date(updates.start)
      );
    }
    
    if (updates.end) {
      updateData.endTimestamp = Timestamp.fromDate(
        updates.end instanceof Date ? updates.end : new Date(updates.end)
      );
    }
    
    if (updates.durationMinutes !== undefined) {
      updateData.durationMinutes = updates.durationMinutes;
      
      // If duration changed but end time wasn't provided, recalculate end time
      if (!updates.end && updates.start) {
        const startDate = updates.start instanceof Date ? updates.start : new Date(updates.start);
        updateData.endTimestamp = Timestamp.fromDate(
          new Date(startDate.getTime() + updates.durationMinutes * 60000)
        );
      }
    }
    
    await updateDoc(sessionRef, updateData);
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

// Delete a study session
export const deleteSession = async (sessionId: string): Promise<void> => {
  if (!sessionId) {
    throw new Error("Session ID is required for deletion");
  }
  
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

// Profile data interfaces
export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  period: string;
  gpa: string;
}

export interface Certification {
  id: string;
  name: string;
  date: string;
  link: string;
}

export interface Badge {
  id: string;
  imageUrl: string;
  name?: string;
}

export interface ProfileLink {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface ProfileData {
  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  resume: string;
  profileComplete: number;
  bio?: string;
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  links: ProfileLink[];
  skills: string[];
  badges: Badge[];
}

// Profile data helpers
export const getProfileData = async (userId: string): Promise<ProfileData | null> => {
  if (!userId) {
    console.error("getProfileData: User ID is required");
    throw new Error("User ID is required to get profile data");
  }
  
  console.log(`getProfileData: Starting to get profile data for userId: ${userId}`);
  
  try {
    // Get user document
    const userRef = doc(db, "users", userId);
    console.log(`getProfileData: Fetching main user document from users/${userId}`);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn(`getProfileData: No profile data found for user: ${userId}. Document does not exist.`);
      return null;
    }
    
    const userData = userSnap.data();
    if (!userData) {
      console.warn(`getProfileData: User document exists for ${userId}, but data is undefined.`);
      return null; // Should not happen if exists() is true, but good practice
    }
    console.log("getProfileData: Retrieved user document data:", JSON.stringify(userData, null, 2));
    
    // Extract skills, links, and work experience from the main user document
    const skills = userData.skillsArray || [];
    const links = userData.linksArray || [];
    const workExperience = userData.workExperienceArray || [];
    const education = userData.educationArray || [];
    const certifications = userData.certificationsArray || [];
    const badges = userData.badgesArray || [];
    
    console.log(`getProfileData: Extracted ${skills.length} skills, ${links.length} links, ${workExperience.length} work experience entries, ${education.length} education entries, ${certifications.length} certifications, and ${badges.length} badges from user document.`);
    
    // Build the profile data object with defaults for all fields
    const profileData: ProfileData = {
      name: userData.displayName || "",
      username: userData.username || "",
      email: userData.email || "",
      phone: userData.phone || "",
      location: userData.location || "",
      resume: userData.resume || "",
      profileComplete: userData.profileComplete || 0,
      bio: userData.bio || "",
      workExperience, // Use the work experience from the main user document
      education, // Use the education from the main user document
      certifications, // Use the certifications from the main user document
      badges, // Use the badges from the main user document
      links: links,
      skills: skills
    };
    
    console.log("getProfileData: Assembled profile data:", JSON.stringify(profileData, null, 2));
    return profileData;
  } catch (error) {
    console.error(`getProfileData: Critical error getting profile data for ${userId}:`, error);
    throw error; // Re-throw the error to be caught by the calling function
  }
};

// Calculate profile completion percentage
export const calculateProfileCompletion = (data: Partial<ProfileData>): number => {
  let completedFields = 0;
  const totalFields = 6; // name, email, phone, location, resume, skills
  if (data.name) completedFields++;
  if (data.email) completedFields++;
  if (data.phone) completedFields++;
  if (data.location) completedFields++;
  if (data.resume) completedFields++;
  if (data.skills && data.skills.length > 0) completedFields++;
  
  return Math.round((completedFields / totalFields) * 100);
};

// Updated saveProfileData to include skills and links arrays
export const saveProfileData = async (userId: string, profileData: Partial<ProfileData>): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to save profile data");
  }
  
  try {
    console.log("Saving profile data for userId:", userId);
    
    // Clean the data before saving - convert undefined values to null
    // and omit any undefined fields to prevent Firestore errors
    const cleanedData = {
      displayName: profileData.name || null,
      username: profileData.username || null,
      email: profileData.email || null,
      phone: profileData.phone || null,
      location: profileData.location || null,
      resume: profileData.resume || null,
      profileComplete: calculateProfileCompletion(profileData),
      bio: profileData.bio || null, // Convert undefined to null
      badges: profileData.badges || [],
      updatedAt: Timestamp.now()
    };
    
    // Using setDoc with merge option to create the document if it doesn't exist
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, cleanedData, { merge: true }); // This will merge changes with existing document or create a new one
    
    console.log("Basic profile data saved");
  } catch (error) {
    console.error("Error saving profile data:", error);
    throw error;
  }
};

// New function to add a skill directly to the user document
export const addSkillToUserDoc = async (userId: string, skillName: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to add a skill");
  }
  
  console.log(`addSkillToUserDoc: Attempting to add skill '${skillName}' for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current skills array or initialize an empty one
    const userData = userDoc.data();
    const currentSkills = userData.skillsArray || [];
    
    // Check if skill already exists
    if (currentSkills.includes(skillName)) {
      console.log(`addSkillToUserDoc: Skill '${skillName}' already exists, not adding duplicate.`);
      return;
    }
    
    // Add the new skill to the array
    const updatedSkills = [...currentSkills, skillName];
    
    // Update the user document with the new skills array
    await updateDoc(userRef, {
      skillsArray: updatedSkills,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addSkillToUserDoc: Successfully added skill '${skillName}' to user document.`);
  } catch (error) {
    console.error(`addSkillToUserDoc: Error adding skill '${skillName}' to user document:`, error);
    throw error;
  }
};

// New function to remove a skill from the user document
export const removeSkillFromUserDoc = async (userId: string, skillName: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to remove a skill");
  }
  
  console.log(`removeSkillFromUserDoc: Attempting to remove skill '${skillName}' for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current skills array or initialize an empty one
    const userData = userDoc.data();
    const currentSkills = userData.skillsArray || [];
    
    // Remove the skill from the array
    const updatedSkills = currentSkills.filter(skill => skill !== skillName);
    
    // Update the user document with the new skills array
    await updateDoc(userRef, {
      skillsArray: updatedSkills,
      updatedAt: Timestamp.now()
    });
    
    console.log(`removeSkillFromUserDoc: Successfully removed skill '${skillName}' from user document.`);
  } catch (error) {
    console.error(`removeSkillFromUserDoc: Error removing skill '${skillName}' from user document:`, error);
    throw error;
  }
};

// New function to add a link directly to the user document
export const addLinkToUserDoc = async (userId: string, link: { title: string, url: string, type?: string }): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add a link");
  }
  
  console.log(`addLinkToUserDoc: Attempting to add link for userId: ${userId}`, link);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current links array or initialize an empty one
    const userData = userDoc.data();
    const currentLinks = userData.linksArray || [];
    
    // Create a new link object with ID
    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate a unique ID
    const newLink = {
      id: linkId,
      title: link.title,
      url: link.url,
      type: link.type || 'website',
      createdAt: Timestamp.now()
    };
    
    // Add the new link to the array
    const updatedLinks = [...currentLinks, newLink];
    
    // Update the user document with the new links array
    await updateDoc(userRef, {
      linksArray: updatedLinks,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addLinkToUserDoc: Successfully added link '${link.title}' with ID ${linkId} to user document.`);
    return linkId;
  } catch (error) {
    console.error(`addLinkToUserDoc: Error adding link to user document:`, error);
    throw error;
  }
};

// New function to update a link in the user document
export const updateLinkInUserDoc = async (userId: string, linkId: string, linkUpdates: { title?: string, url?: string, type?: string }): Promise<void> => {
  if (!userId || !linkId) {
    throw new Error("User ID and Link ID are required for updates");
  }
  
  console.log(`updateLinkInUserDoc: Attempting to update link ${linkId} for userId: ${userId}`, linkUpdates);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current links array
    const userData = userDoc.data();
    const currentLinks = userData.linksArray || [];
    
    // Find the link to update
    const updatedLinks = currentLinks.map(link => {
      if (link.id === linkId) {
        return {
          ...link,
          ...linkUpdates,
          updatedAt: Timestamp.now()
        };
      }
      return link;
    });
    
    // Check if the link was found and updated
    if (JSON.stringify(updatedLinks) === JSON.stringify(currentLinks)) {
      console.warn(`updateLinkInUserDoc: Link with ID ${linkId} not found in user document.`);
    }
    
    // Update the user document with the new links array
    await updateDoc(userRef, {
      linksArray: updatedLinks,
      updatedAt: Timestamp.now()
    });
    
    console.log(`updateLinkInUserDoc: Successfully updated link ${linkId} in user document.`);
  } catch (error) {
    console.error(`updateLinkInUserDoc: Error updating link ${linkId} in user document:`, error);
    throw error;
  }
};

// New function to delete a link from the user document
export const deleteLinkFromUserDoc = async (userId: string, linkId: string): Promise<void> => {
  if (!userId || !linkId) {
    throw new Error("User ID and Link ID are required for deletion");
  }
  
  console.log(`deleteLinkFromUserDoc: Attempting to delete link ${linkId} for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current links array
    const userData = userDoc.data();
    const currentLinks = userData.linksArray || [];
    
    // Remove the link from the array
    const updatedLinks = currentLinks.filter(link => link.id !== linkId);
    
    // Check if the link was found and removed
    if (updatedLinks.length === currentLinks.length) {
      console.warn(`deleteLinkFromUserDoc: Link with ID ${linkId} not found in user document.`);
    }
    
    // Update the user document with the new links array
    await updateDoc(userRef, {
      linksArray: updatedLinks,
      updatedAt: Timestamp.now()
    });
    
    console.log(`deleteLinkFromUserDoc: Successfully deleted link ${linkId} from user document.`);
  } catch (error) {
    console.error(`deleteLinkFromUserDoc: Error deleting link ${linkId} from user document:`, error);
    throw error;
  }
};

// Work Experience helpers
export const addWorkExperience = async (userId: string, workExp: Omit<WorkExperience, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add work experience");
  }
  
  try {
    console.log("Adding work experience for userId:", userId);
    
    const workExpRef = collection(db, "users", userId, "workExperience");
    const docRef = await addDoc(workExpRef, {
      ...workExp,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding work experience:", error);
    throw error;
  }
};

export const updateWorkExperience = async (userId: string, workExpId: string, workExp: Partial<WorkExperience>): Promise<void> => {
  if (!userId || !workExpId) {
    throw new Error("User ID and Work Experience ID are required for updates");
  }
  
  try {
    console.log("Updating work experience for userId:", userId);
    
    const workExpRef = doc(db, "users", userId, "workExperience", workExpId);
    await updateDoc(workExpRef, {
      ...workExp,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating work experience:", error);
    throw error;
  }
};

export const deleteWorkExperience = async (userId: string, workExpId: string): Promise<void> => {
  if (!userId || !workExpId) {
    throw new Error("User ID and Work Experience ID are required for deletion");
  }
  
  try {
    console.log("Deleting work experience for userId:", userId);
    
    const workExpRef = doc(db, "users", userId, "workExperience", workExpId);
    await deleteDoc(workExpRef);
  } catch (error) {
    console.error("Error deleting work experience:", error);
    throw error;
  }
};

// Education helpers
export const addEducation = async (userId: string, education: Omit<Education, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add education");
  }
  
  try {
    console.log("Adding education for userId:", userId);
    
    const educationRef = collection(db, "users", userId, "education");
    const docRef = await addDoc(educationRef, {
      ...education,
      createdAt: Timestamp.now()
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding education:", error);
    throw error;
  }
};

export const updateEducation = async (userId: string, educationId: string, education: Partial<Education>): Promise<void> => {
  if (!userId || !educationId) {
    throw new Error("User ID and Education ID are required for updates");
  }
  
  try {
    console.log("Updating education for userId:", userId);
    
    const educationRef = doc(db, "users", userId, "education", educationId);
    await updateDoc(educationRef, {
      ...education,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error("Error updating education:", error);
    throw error;
  }
};

export const deleteEducation = async (userId: string, educationId: string): Promise<void> => {
  if (!userId || !educationId) {
    throw new Error("User ID and Education ID are required for deletion");
  }
  
  try {
    console.log("Deleting education for userId:", userId);
    
    const educationRef = doc(db, "users", userId, "education", educationId);
    await deleteDoc(educationRef);
  } catch (error) {
    console.error("Error deleting education:", error);
    throw error;
  }
};

// Links helpers
export const addProfileLink = async (userId: string, link: Omit<ProfileLink, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add a link");
  }
  
  console.log(`addProfileLink: Attempting to add link for userId: ${userId}`, link);
  try {
    const linksRef = collection(db, "users", userId, "links");
    const dataToSave = {
      ...link,
      createdAt: Timestamp.now()
    };
    console.log("addProfileLink: Data being sent to Firestore:", dataToSave);
    const docRef = await addDoc(linksRef, dataToSave);
    console.log(`addProfileLink: Link added successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`addProfileLink: Error adding link for userId: ${userId}`, error);
    throw error;
  }
};

export const updateProfileLink = async (userId: string, linkId: string, link: Partial<ProfileLink>): Promise<void> => {
  if (!userId || !linkId) {
    throw new Error("User ID and Link ID are required for updates");
  }
  
  console.log(`updateProfileLink: Attempting to update link ${linkId} for userId: ${userId}`, link);
  try {
    const linkRef = doc(db, "users", userId, "links", linkId);
    const dataToUpdate = {
      ...link,
      updatedAt: Timestamp.now()
    };
    console.log("updateProfileLink: Data being sent to Firestore:", dataToUpdate);
    await updateDoc(linkRef, dataToUpdate);
    console.log(`updateProfileLink: Link ${linkId} updated successfully.`);
  } catch (error) {
    console.error(`updateProfileLink: Error updating link ${linkId} for userId: ${userId}`, error);
    throw error;
  }
};

export const deleteProfileLink = async (userId: string, linkId: string): Promise<void> => {
  if (!userId || !linkId) {
    throw new Error("User ID and Link ID are required for deletion");
  }
  
  try {
    console.log("Deleting link for userId:", userId);
    
    const linkRef = doc(db, "users", userId, "links", linkId);
    await deleteDoc(linkRef);
  } catch (error) {
    console.error("Error deleting link:", error);
    throw error;
  }
};

// Skills helpers
export const addSkill = async (userId: string, skillName: string): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add a skill");
  }
  
  console.log(`addSkill: Attempting to add skill '${skillName}' for userId: ${userId}`);
  try {
    const skillsRef = collection(db, "users", userId, "skills");
    
    // First check if this skill already exists to avoid duplicates
    console.log(`addSkill: Checking if skill '${skillName}' already exists.`);
    const q = query(skillsRef, where("name", "==", skillName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingDocId = querySnapshot.docs[0].id;
      console.log(`addSkill: Skill '${skillName}' already exists with ID ${existingDocId}, not adding duplicate.`);
      return existingDocId; // Return existing ID
    }
    
    // Add the new skill
    const dataToSave = {
      name: skillName,
      createdAt: Timestamp.now()
    };
    console.log("addSkill: Data being sent to Firestore:", dataToSave);
    const docRef = await addDoc(skillsRef, dataToSave);
    console.log(`addSkill: Added skill '${skillName}' successfully with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error(`addSkill: Error adding skill '${skillName}' for userId: ${userId}`, error);
    throw error;
  }
};

export const deleteSkill = async (userId: string, skillName: string): Promise<void> => {
  if (!userId) {
    throw new Error("User ID is required to delete a skill");
  }
  
  try {
    console.log("Deleting skill for userId:", userId);
    
    // Find the skill document with the given name
    const skillsRef = collection(db, "users", userId, "skills");
    const q = query(skillsRef, where("name", "==", skillName));
    const querySnapshot = await getDocs(q);
    
    // Delete all matching skill documents (avoid deleting the initialization document)
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach(doc => {
      // Skip initialization document
      if (doc.data()._isInitialization) return;
      
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log(`Deleted ${deletePromises.length} skill documents for '${skillName}'`);
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
};

// Call this function to ensure collections exist
ensureCollectionsExist();

// Add a new helper function to properly initialize the user profile with all required collections
export const initializeUserProfile = async (user: User, displayName?: string) => {
  try {
    // Create the main user document
    const userRef = doc(db, "users", user.uid);
    
    // Use the display name from the parameter or from the user object
    const userDisplayName = displayName || user.displayName || user.email?.split('@')[0] || 'User';
    
    // Set initial profile data with proper null values to prevent undefined
    await setDoc(userRef, {
      displayName: userDisplayName,
      email: user.email || null,
      username: '@' + userDisplayName.replace(/\s+/g, '').toLowerCase(),
      phone: '',
      location: '',
      resume: '',
      profileComplete: 0,
      bio: '',  // Empty string instead of undefined
      badges: [{ name: 'Task Titan', level: 1 }],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log("User profile initialized for", user.uid);
    
    // Initialize empty subcollections with a dummy document to ensure they exist
    // This helps with security rules and queries
    const subcollections = ['workExperience', 'education', 'links', 'skills'];
    
    for (const collection of subcollections) {
      const dummyDocRef = doc(db, "users", user.uid, collection, "initialization");
      await setDoc(dummyDocRef, { 
        _isInitialization: true,
        createdAt: Timestamp.now()
      });
      console.log(`Initialized ${collection} subcollection`);
    }
    
    return true;
  } catch (error) {
    console.error("Error initializing user profile:", error);
    throw error;
  }
};

// New function to add work experience directly to the user document
export const addWorkExperienceToUserDoc = async (userId: string, workExp: Omit<WorkExperience, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add work experience");
  }
  
  console.log(`addWorkExperienceToUserDoc: Attempting to add work experience for userId: ${userId}`, workExp);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current work experience array or initialize an empty one
    const userData = userDoc.data();
    const currentWorkExperience = userData.workExperienceArray || [];
    
    // Create a new work experience object with ID
    const workExpId = `work_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate a unique ID
    const newWorkExp = {
      id: workExpId,
      company: workExp.company || '',
      role: workExp.role || '',
      period: workExp.period || '',
      location: workExp.location || '',
      description: workExp.description || '',
      createdAt: Timestamp.now()
    };
    
    // Add the new work experience to the array
    const updatedWorkExperience = [...currentWorkExperience, newWorkExp];
    
    // Update the user document with the new work experience array
    await updateDoc(userRef, {
      workExperienceArray: updatedWorkExperience,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addWorkExperienceToUserDoc: Successfully added work experience for '${workExp.company}' with ID ${workExpId} to user document.`);
    return workExpId;
  } catch (error) {
    console.error(`addWorkExperienceToUserDoc: Error adding work experience to user document:`, error);
    throw error;
  }
};

// New function to update work experience in the user document
export const updateWorkExperienceInUserDoc = async (
  userId: string, 
  workExpId: string, 
  workExpUpdates: Partial<WorkExperience>
): Promise<void> => {
  if (!userId || !workExpId) {
    throw new Error("User ID and Work Experience ID are required for updates");
  }
  
  console.log(`updateWorkExperienceInUserDoc: Attempting to update work experience ${workExpId} for userId: ${userId}`, workExpUpdates);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current work experience array
    const userData = userDoc.data();
    const currentWorkExperience = userData.workExperienceArray || [];
    
    // Find the work experience to update
    const updatedWorkExperience = currentWorkExperience.map(workExp => {
      if (workExp.id === workExpId) {
        return {
          ...workExp,
          ...workExpUpdates,
          updatedAt: Timestamp.now()
        };
      }
      return workExp;
    });
    
    // Check if the work experience was found and updated
    if (JSON.stringify(updatedWorkExperience) === JSON.stringify(currentWorkExperience)) {
      console.warn(`updateWorkExperienceInUserDoc: Work experience with ID ${workExpId} not found in user document.`);
    }
    
    // Update the user document with the new work experience array
    await updateDoc(userRef, {
      workExperienceArray: updatedWorkExperience,
      updatedAt: Timestamp.now()
    });
    
    console.log(`updateWorkExperienceInUserDoc: Successfully updated work experience ${workExpId} in user document.`);
  } catch (error) {
    console.error(`updateWorkExperienceInUserDoc: Error updating work experience ${workExpId} in user document:`, error);
    throw error;
  }
};

// New function to delete work experience from the user document
export const deleteWorkExperienceFromUserDoc = async (userId: string, workExpId: string): Promise<void> => {
  if (!userId || !workExpId) {
    throw new Error("User ID and Work Experience ID are required for deletion");
  }
  
  console.log(`deleteWorkExperienceFromUserDoc: Attempting to delete work experience ${workExpId} for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current work experience array
    const userData = userDoc.data();
    const currentWorkExperience = userData.workExperienceArray || [];
    
    // Remove the work experience from the array
    const updatedWorkExperience = currentWorkExperience.filter(workExp => workExp.id !== workExpId);
    
    // Check if the work experience was found and removed
    if (updatedWorkExperience.length === currentWorkExperience.length) {
      console.warn(`deleteWorkExperienceFromUserDoc: Work experience with ID ${workExpId} not found in user document.`);
    }
    
    // Update the user document with the new work experience array
    await updateDoc(userRef, {
      workExperienceArray: updatedWorkExperience,
      updatedAt: Timestamp.now()
    });
    
    console.log(`deleteWorkExperienceFromUserDoc: Successfully deleted work experience ${workExpId} from user document.`);
  } catch (error) {
    console.error(`deleteWorkExperienceFromUserDoc: Error deleting work experience ${workExpId} from user document:`, error);
    throw error;
  }
};

// New function to add education directly to the user document
export const addEducationToUserDoc = async (userId: string, education: Omit<Education, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add education");
  }
  
  console.log(`addEducationToUserDoc: Attempting to add education for userId: ${userId}`, education);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current education array or initialize an empty one
    const userData = userDoc.data();
    const currentEducation = userData.educationArray || [];
    
    // Create a new education object with ID
    const educationId = `edu_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate a unique ID
    const newEducation = {
      id: educationId,
      institution: education.institution || '',
      degree: education.degree || '',
      period: education.period || '',
      gpa: education.gpa || '',
      createdAt: Timestamp.now()
    };
    
    // Add the new education to the array
    const updatedEducation = [...currentEducation, newEducation];
    
    // Update the user document with the new education array
    await updateDoc(userRef, {
      educationArray: updatedEducation,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addEducationToUserDoc: Successfully added education for '${education.institution}' with ID ${educationId} to user document.`);
    return educationId;
  } catch (error) {
    console.error(`addEducationToUserDoc: Error adding education to user document:`, error);
    throw error;
  }
};

// New function to update education in the user document
export const updateEducationInUserDoc = async (
  userId: string, 
  educationId: string, 
  educationUpdates: Partial<Education>
): Promise<void> => {
  if (!userId || !educationId) {
    throw new Error("User ID and Education ID are required for updates");
  }
  
  console.log(`updateEducationInUserDoc: Attempting to update education ${educationId} for userId: ${userId}`, educationUpdates);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current education array
    const userData = userDoc.data();
    const currentEducation = userData.educationArray || [];
    
    // Find the education to update
    const updatedEducation = currentEducation.map(education => {
      if (education.id === educationId) {
        return {
          ...education,
          ...educationUpdates,
          updatedAt: Timestamp.now()
        };
      }
      return education;
    });
    
    // Check if the education was found and updated
    if (JSON.stringify(updatedEducation) === JSON.stringify(currentEducation)) {
      console.warn(`updateEducationInUserDoc: Education with ID ${educationId} not found in user document.`);
    }
    
    // Update the user document with the new education array
    await updateDoc(userRef, {
      educationArray: updatedEducation,
      updatedAt: Timestamp.now()
    });
    
    console.log(`updateEducationInUserDoc: Successfully updated education ${educationId} in user document.`);
  } catch (error) {
    console.error(`updateEducationInUserDoc: Error updating education ${educationId} in user document:`, error);
    throw error;
  }
};

// New function to delete education from the user document
export const deleteEducationFromUserDoc = async (userId: string, educationId: string): Promise<void> => {
  if (!userId || !educationId) {
    throw new Error("User ID and Education ID are required for deletion");
  }
  
  console.log(`deleteEducationFromUserDoc: Attempting to delete education ${educationId} for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current education array
    const userData = userDoc.data();
    const currentEducation = userData.educationArray || [];
    
    // Remove the education from the array
    const updatedEducation = currentEducation.filter(education => education.id !== educationId);
    
    // Check if the education was found and removed
    if (updatedEducation.length === currentEducation.length) {
      console.warn(`deleteEducationFromUserDoc: Education with ID ${educationId} not found in user document.`);
    }
    
    // Update the user document with the new education array
    await updateDoc(userRef, {
      educationArray: updatedEducation,
      updatedAt: Timestamp.now()
    });
    
    console.log(`deleteEducationFromUserDoc: Successfully deleted education ${educationId} from user document.`);
  } catch (error) {
    console.error(`deleteEducationFromUserDoc: Error deleting education ${educationId} from user document:`, error);
    throw error;
  }
};

// Certification functions
// New function to add certification directly to the user document
export const addCertificationToUserDoc = async (userId: string, certification: Omit<Certification, 'id'>): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add certification");
  }
  
  console.log(`addCertificationToUserDoc: Attempting to add certification for userId: ${userId}`, certification);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current certifications array or initialize an empty one
    const userData = userDoc.data();
    const currentCertifications = userData.certificationsArray || [];
    
    // Create a new certification object with ID
    const certificationId = `cert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate a unique ID
    const newCertification = {
      id: certificationId,
      name: certification.name || '',
      date: certification.date || '',
      link: certification.link || '',
      createdAt: Timestamp.now()
    };
    
    // Add the new certification to the array
    const updatedCertifications = [...currentCertifications, newCertification];
    
    // Update the user document with the new certifications array
    await updateDoc(userRef, {
      certificationsArray: updatedCertifications,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addCertificationToUserDoc: Successfully added certification '${certification.name}' with ID ${certificationId} to user document.`);
    return certificationId;
  } catch (error) {
    console.error(`addCertificationToUserDoc: Error adding certification to user document:`, error);
    throw error;
  }
};

// New function to update certification in the user document
export const updateCertificationInUserDoc = async (
  userId: string, 
  certificationId: string, 
  certificationUpdates: Partial<Certification>
): Promise<void> => {
  if (!userId || !certificationId) {
    throw new Error("User ID and Certification ID are required for updates");
  }
  
  console.log(`updateCertificationInUserDoc: Attempting to update certification ${certificationId} for userId: ${userId}`, certificationUpdates);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current certifications array
    const userData = userDoc.data();
    const currentCertifications = userData.certificationsArray || [];
    
    // Find the certification to update
    const updatedCertifications = currentCertifications.map(certification => {
      if (certification.id === certificationId) {
        return {
          ...certification,
          ...certificationUpdates,
          updatedAt: Timestamp.now()
        };
      }
      return certification;
    });
    
    // Check if the certification was found and updated
    if (JSON.stringify(updatedCertifications) === JSON.stringify(currentCertifications)) {
      console.warn(`updateCertificationInUserDoc: Certification with ID ${certificationId} not found in user document.`);
    }
    
    // Update the user document with the new certifications array
    await updateDoc(userRef, {
      certificationsArray: updatedCertifications,
      updatedAt: Timestamp.now()
    });
    
    console.log(`updateCertificationInUserDoc: Successfully updated certification ${certificationId} in user document.`);
  } catch (error) {
    console.error(`updateCertificationInUserDoc: Error updating certification ${certificationId} in user document:`, error);
    throw error;
  }
};

// New function to delete certification from the user document
export const deleteCertificationFromUserDoc = async (userId: string, certificationId: string): Promise<void> => {
  if (!userId || !certificationId) {
    throw new Error("User ID and Certification ID are required for deletion");
  }
  
  console.log(`deleteCertificationFromUserDoc: Attempting to delete certification ${certificationId} for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current certifications array
    const userData = userDoc.data();
    const currentCertifications = userData.certificationsArray || [];
    
    // Remove the certification from the array
    const updatedCertifications = currentCertifications.filter(certification => certification.id !== certificationId);
    
    // Check if the certification was found and removed
    if (updatedCertifications.length === currentCertifications.length) {
      console.warn(`deleteCertificationFromUserDoc: Certification with ID ${certificationId} not found in user document.`);
    }
    
    // Update the user document with the new certifications array
    await updateDoc(userRef, {
      certificationsArray: updatedCertifications,
      updatedAt: Timestamp.now()
    });
    
    console.log(`deleteCertificationFromUserDoc: Successfully deleted certification ${certificationId} from user document.`);
  } catch (error) {
    console.error(`deleteCertificationFromUserDoc: Error deleting certification ${certificationId} from user document:`, error);
    throw error;
  }
};

// New function to add badge directly to the user document
export const addBadgeToUserDoc = async (userId: string, badge: { imageUrl: string, name?: string }): Promise<string> => {
  if (!userId) {
    throw new Error("User ID is required to add badge");
  }
  
  console.log(`addBadgeToUserDoc: Attempting to add badge for userId: ${userId}`, badge);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current badges array or initialize an empty one
    const userData = userDoc.data();
    const currentBadges = userData.badgesArray || [];
    
    // Create a new badge object with ID
    const badgeId = `badge_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`; // Generate a unique ID
    const newBadge = {
      id: badgeId,
      imageUrl: badge.imageUrl || '',
      name: badge.name || '',
      createdAt: Timestamp.now()
    };
    
    // Add the new badge to the array
    const updatedBadges = [...currentBadges, newBadge];
    
    // Update the user document with the new badges array
    await updateDoc(userRef, {
      badgesArray: updatedBadges,
      updatedAt: Timestamp.now()
    });
    
    console.log(`addBadgeToUserDoc: Successfully added badge with ID ${badgeId} to user document.`);
    return badgeId;
  } catch (error) {
    console.error(`addBadgeToUserDoc: Error adding badge to user document:`, error);
    throw error;
  }
};

// New function to update badge in the user document
export const updateBadgeInUserDoc = async (
  userId: string, 
  badgeId: string, 
  badgeUpdates: { imageUrl?: string, name?: string }
): Promise<void> => {
  if (!userId || !badgeId) {
    throw new Error("User ID and Badge ID are required for updates");
  }
  
  console.log(`updateBadgeInUserDoc: Attempting to update badge ${badgeId} for userId: ${userId}`, badgeUpdates);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current badges array
    const userData = userDoc.data();
    const currentBadges = userData.badgesArray || [];
    
    // Find the badge to update
    const updatedBadges = currentBadges.map(badge => {
      if (badge.id === badgeId) {
        return {
          ...badge,
          ...badgeUpdates,
          updatedAt: Timestamp.now()
        };
      }
      return badge;
    });
    
    // Check if the badge was found and updated
    if (JSON.stringify(updatedBadges) === JSON.stringify(currentBadges)) {
      console.warn(`updateBadgeInUserDoc: Badge with ID ${badgeId} not found in user document.`);
    }
    
    // Update the user document with the new badges array
    await updateDoc(userRef, {
      badgesArray: updatedBadges,
      updatedAt: Timestamp.now()
    });
    
    console.log(`updateBadgeInUserDoc: Successfully updated badge ${badgeId} in user document.`);
  } catch (error) {
    console.error(`updateBadgeInUserDoc: Error updating badge ${badgeId} in user document:`, error);
    throw error;
  }
};

// New function to delete badge from the user document
export const deleteBadgeFromUserDoc = async (userId: string, badgeId: string): Promise<void> => {
  if (!userId || !badgeId) {
    throw new Error("User ID and Badge ID are required for deletion");
  }
  
  console.log(`deleteBadgeFromUserDoc: Attempting to delete badge ${badgeId} for userId: ${userId}`);
  try {
    // Get the current user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("User document does not exist");
    }
    
    // Get current badges array
    const userData = userDoc.data();
    const currentBadges = userData.badgesArray || [];
    
    // Remove the badge from the array
    const updatedBadges = currentBadges.filter(badge => badge.id !== badgeId);
    
    // Check if the badge was found and removed
    if (updatedBadges.length === currentBadges.length) {
      console.warn(`deleteBadgeFromUserDoc: Badge with ID ${badgeId} not found in user document.`);
    }
    
    // Update the user document with the new badges array
    await updateDoc(userRef, {
      badgesArray: updatedBadges,
      updatedAt: Timestamp.now()
    });
    
    console.log(`deleteBadgeFromUserDoc: Successfully deleted badge ${badgeId} from user document.`);
  } catch (error) {
    console.error(`deleteBadgeFromUserDoc: Error deleting badge ${badgeId} from user document:`, error);
    throw error;
  }
};

export { auth, db };
export default app; 