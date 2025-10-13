import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Users, 
  Download,
  Upload,
  Calendar,
  Clock,
  Star,
  Search,
  Filter,
  Plus,
  Share2,
  MessageCircle,
  Award,
  TrendingUp,
  CheckCircle2,
  X,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  Bookmark,
  Send,
  Bell
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Academic() {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [downloadedMaterials, setDownloadedMaterials] = useState<number[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = useState<number[]>([]);
  const [reminders, setReminders] = useState<number[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    subject: '',
    professor: '',
    type: 'pdf'
  });
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: ''
  });
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    points: ''
  });
  
  const studyMaterials = [
    { 
      title: 'Data Structures Notes - Unit 1', 
      subject: 'Computer Science',
      professor: 'Dr. Sharma',
      uploadDate: '2025-01-15',
      downloads: 245,
      rating: 4.8,
      type: 'pdf',
      size: '2.3 MB'
    },
    { 
      title: 'Operating Systems Lab Manual', 
      subject: 'Computer Science',
      professor: 'Prof. Kumar',
      uploadDate: '2025-01-12',
      downloads: 189,
      rating: 4.6,
      type: 'pdf',
      size: '5.1 MB'
    },
    { 
      title: 'Database Design Project Template', 
      subject: 'Database Systems',
      professor: 'Dr. Patel',
      uploadDate: '2025-01-10',
      downloads: 156,
      rating: 4.9,
      type: 'docx',
      size: '1.8 MB'
    },
  ];
  
  const assignments = [
    { 
      title: 'Implement Binary Search Tree',
      subject: 'Data Structures',
      dueDate: '2025-01-25',
      status: 'pending',
      points: 100,
      description: 'Create a complete BST implementation with insertion, deletion, and traversal methods.'
    },
    { 
      title: 'Database Normalization Project',
      subject: 'Database Systems',
      dueDate: '2025-01-30',
      status: 'in_progress',
      points: 150,
      description: 'Normalize a given database schema to 3NF and document the process.'
    },
    { 
      title: 'Operating System Simulation',
      subject: 'Operating Systems',
      dueDate: '2025-02-05',
      status: 'pending',
      points: 200,
      description: 'Simulate process scheduling algorithms using C++.'
    },
  ];
  
  const studyGroups = [
    { 
      name: 'Data Structures Study Group',
      subject: 'Computer Science',
      members: 12,
      nextMeeting: '2025-01-20',
      description: 'Weekly study sessions for DS concepts and problem solving.'
    },
    { 
      name: 'Database Design Team',
      subject: 'Database Systems',
      members: 8,
      nextMeeting: '2025-01-22',
      description: 'Collaborative project work and peer review sessions.'
    },
    { 
      name: 'Algorithm Practice Group',
      subject: 'Algorithms',
      members: 15,
      nextMeeting: '2025-01-18',
      description: 'Daily coding practice and algorithm discussions.'
    },
  ];
  
  const upcomingExams = [
    { subject: 'Data Structures', date: '2025-02-15', time: '10:00 AM', duration: '3 hours' },
    { subject: 'Operating Systems', date: '2025-02-20', time: '2:00 PM', duration: '2 hours' },
    { subject: 'Database Systems', date: '2025-02-25', time: '9:00 AM', duration: '2.5 hours' },
  ];
  
  // Interactive Functions
  const handleDownloadMaterial = (materialId: number) => {
    setDownloadedMaterials(prev => [...prev, materialId]);
    toast.success('Material downloaded successfully!');
  };
  
  const handleJoinGroup = (groupId: number) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(prev => prev.filter(id => id !== groupId));
      toast.success('Left the study group');
    } else {
      setJoinedGroups(prev => [...prev, groupId]);
      toast.success('Successfully joined the study group!');
    }
  };
  
  const handleSubmitAssignment = (assignmentId: number) => {
    setSubmittedAssignments(prev => [...prev, assignmentId]);
    toast.success('Assignment submitted successfully!');
  };
  
  const handleUploadMaterial = () => {
    if (newMaterial.title && newMaterial.subject && newMaterial.professor) {
      toast.success('Material uploaded successfully!');
      setNewMaterial({ title: '', description: '', subject: '', professor: '', type: 'pdf' });
      setShowUploadDialog(false);
    } else {
      toast.error('Please fill in all required fields');
    }
  };
  
  const handleCreateGroup = () => {
    if (newGroup.name && newGroup.description && newGroup.subject) {
      toast.success('Study group created successfully!');
      setNewGroup({ name: '', description: '', subject: '' });
      setShowCreateGroup(false);
    } else {
      toast.error('Please fill in all required fields');
    }
  };
  
  const handleCreateAssignment = () => {
    if (newAssignment.title && newAssignment.subject && newAssignment.dueDate && newAssignment.points) {
      // Set reminder for assignment due date
      const dueDate = new Date(newAssignment.dueDate);
      const now = new Date();
      const timeDiff = dueDate.getTime() - now.getTime();
      
      if (timeDiff > 0) {
        // Set reminder 1 day before due date
        const reminderTime = dueDate.getTime() - (24 * 60 * 60 * 1000);
        const timeUntilReminder = reminderTime - now.getTime();
        
        if (timeUntilReminder > 0) {
          setTimeout(() => {
            toast.success(`Reminder: ${newAssignment.title} is due tomorrow!`);
          }, timeUntilReminder);
        }
      }
      
      toast.success('Assignment created successfully!');
      setNewAssignment({ title: '', description: '', subject: '', dueDate: '', points: '' });
      setShowAssignmentDialog(false);
    } else {
      toast.error('Please fill in all required fields');
    }
  };
  
  const handleSetReminder = (itemId: number, itemType: 'assignment' | 'exam', dueDate: string) => {
    if (reminders.includes(itemId)) {
      setReminders(prev => prev.filter(id => id !== itemId));
      toast.success('Reminder removed');
    } else {
      setReminders(prev => [...prev, itemId]);
      
      // Set browser notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            const dueDateObj = new Date(dueDate);
            const now = new Date();
            const timeDiff = dueDateObj.getTime() - now.getTime();
            
            if (timeDiff > 0) {
              // Set reminder 1 day before
              const reminderTime = dueDateObj.getTime() - (24 * 60 * 60 * 1000);
              const timeUntilReminder = reminderTime - now.getTime();
              
              if (timeUntilReminder > 0) {
                setTimeout(() => {
                  new Notification(`Reminder: ${itemType === 'assignment' ? 'Assignment' : 'Exam'} due tomorrow!`);
                }, timeUntilReminder);
              }
            }
          }
        });
      }
      
      toast.success('Reminder set successfully!');
    }
  };
  
  const filteredMaterials = studyMaterials.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.professor.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredGroups = studyGroups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const generateCalendarUrl = (event: any) => {
    const startDate = event.start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = event.end.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const details = encodeURIComponent(event.description || '');
    const location = encodeURIComponent(event.location || '');
    const title = encodeURIComponent(event.title);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };
=======
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UtensilsCrossed, 
  Clock, 
  Wallet,
  ShoppingCart,
  CheckCircle2,
  Flame,
  Leaf,
  Timer
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Canteen() {
  const { theme } = useTheme();
  const [cart, setCart] = useState<any[]>([]);
  
  const menuItems = [
    { 
      id: 1,
      name: 'Masala Dosa', 
      price: 60, 
      category: 'breakfast',
      prepTime: 15,
      calories: 450,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop'
    },
    { 
      id: 2,
      name: 'Paneer Butter Masala', 
      price: 120, 
      category: 'lunch',
      prepTime: 20,
      calories: 580,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&h=300&fit=crop'
    },
    { 
      id: 3,
      name: 'Chicken Biryani', 
      price: 150, 
      category: 'lunch',
      prepTime: 25,
      calories: 720,
      veg: false,
      popular: true,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop'
    },
    { 
      id: 4,
      name: 'Veg Sandwich', 
      price: 40, 
      category: 'snacks',
      prepTime: 10,
      calories: 320,
      veg: true,
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
    },
    { 
      id: 5,
      name: 'Samosa (2 pcs)', 
      price: 30, 
      category: 'snacks',
      prepTime: 5,
      calories: 280,
      veg: true,
      popular: true,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop'
    },
    { 
      id: 6,
      name: 'Cold Coffee', 
      price: 50, 
      category: 'beverages',
      prepTime: 5,
      calories: 180,
      veg: true,
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
    },
  ];
  
  const activeOrders = [
    { tokenNo: 42, items: ['Masala Dosa', 'Coffee'], status: 'preparing', time: '5 mins' },
    { tokenNo: 41, items: ['Biryani', 'Raita'], status: 'ready', time: 'Ready' },
  ];
  
  const addToCart = (item: any) => {
    setCart([...cart, item]);
    toast.success(`${item.name} added to cart`);
  };
  
  const placeOrder = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    toast.success('Order placed! Token #43');
    setCart([]);
  };
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
>>>>>>> f7ccad6083d2b24c2d5d6e8d417a075bda1d7b06
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
<<<<<<< HEAD
            Academic Hub
          </span>
        </h1>
        <p className="text-muted-foreground">Study materials, assignments, and collaboration tools</p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <BookOpen className="h-8 w-8 text-blue-500 mb-2" />
          <p className="font-bold text-2xl">24</p>
          <p className="text-sm text-muted-foreground">Study Materials</p>
        </Card>
        
        <Card className="p-6">
          <FileText className="h-8 w-8 text-green-500 mb-2" />
          <p className="font-bold text-2xl">3</p>
          <p className="text-sm text-muted-foreground">Pending Assignments</p>
        </Card>
        
        <Card className="p-6">
          <Users className="h-8 w-8 text-purple-500 mb-2" />
          <p className="font-bold text-2xl">5</p>
          <p className="text-sm text-muted-foreground">Study Groups</p>
        </Card>
        
        <Card className="p-6">
          <Calendar className="h-8 w-8 text-orange-500 mb-2" />
          <p className="font-bold text-2xl">3</p>
          <p className="text-sm text-muted-foreground">Upcoming Exams</p>
        </Card>
      </div>
      
      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials">Study Materials</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="exams">Exams</TabsTrigger>
        </TabsList>
        
        {/* Study Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search materials, subjects, professors..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload Study Material</DialogTitle>
                  <DialogDescription>
                    Share your study materials with fellow students.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="material-title">Title *</Label>
                    <Input
                      id="material-title"
                      value={newMaterial.title}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter material title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="material-description">Description</Label>
                    <Textarea
                      id="material-description"
                      value={newMaterial.description}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the material content"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="material-subject">Subject *</Label>
                      <Input
                        id="material-subject"
                        value={newMaterial.subject}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="material-professor">Professor *</Label>
                      <Input
                        id="material-professor"
                        value={newMaterial.professor}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, professor: e.target.value }))}
                        placeholder="Enter professor name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="material-type">File Type</Label>
                    <select
                      id="material-type"
                      value={newMaterial.type}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">Word Document</option>
                      <option value="pptx">PowerPoint</option>
                      <option value="txt">Text File</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUploadMaterial} className="flex-1">
                      Upload Material
                    </Button>
                    <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map((material, idx) => (
              <Card key={idx} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <Badge variant="outline">{material.type.toUpperCase()}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{material.rating}</span>
                  </div>
                </div>
                
                <h3 className="font-bold mb-2 line-clamp-2">{material.title}</h3>
                <p className="text-sm text-muted-foreground mb-1">{material.subject}</p>
                <p className="text-sm text-muted-foreground mb-3">Prof. {material.professor}</p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>{material.downloads} downloads</span>
                  <span>{material.size}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 ${
                      downloadedMaterials.includes(idx) 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                    onClick={() => handleDownloadMaterial(idx)}
                  >
                    {downloadedMaterials.includes(idx) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </>
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${material.title} - ${material.subject}`);
                      toast.success('Material link copied!');
                    }}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Opening preview...')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Assignments</h2>
            <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Assignment</DialogTitle>
                  <DialogDescription>
                    Create a new assignment for students.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="assignment-title">Title *</Label>
                    <Input
                      id="assignment-title"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter assignment title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assignment-description">Description *</Label>
                    <Textarea
                      id="assignment-description"
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the assignment requirements"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="assignment-subject">Subject *</Label>
                      <Input
                        id="assignment-subject"
                        value={newAssignment.subject}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assignment-points">Points *</Label>
                      <Input
                        id="assignment-points"
                        type="number"
                        value={newAssignment.points}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, points: e.target.value }))}
                        placeholder="Enter points"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="assignment-due">Due Date *</Label>
                    <Input
                      id="assignment-due"
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateAssignment} className="flex-1">
                      Create Assignment
                    </Button>
                    <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            {assignments.map((assignment, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                  </div>
                  <Badge variant={
                    assignment.status === 'completed' ? 'default' :
                    assignment.status === 'in_progress' ? 'secondary' : 'outline'
                  }>
                    {assignment.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      {assignment.points} points
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.success('Opening discussion forum...')}
                    >
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Discuss
                    </Button>
                    <Button 
                      size="sm"
                      className={`${
                        submittedAssignments.includes(idx) 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : ''
                      }`}
                      onClick={() => handleSubmitAssignment(idx)}
                      disabled={submittedAssignments.includes(idx)}
                    >
                      {submittedAssignments.includes(idx) ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Submitted
                        </>
                      ) : assignment.status === 'pending' ? (
                        'Start'
                      ) : (
                        'Continue'
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSetReminder(idx, 'assignment', assignment.dueDate)}
                      className={reminders.includes(idx) ? 'bg-primary/10 text-primary' : ''}
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      {reminders.includes(idx) ? 'Reminder Set' : 'Set Reminder'}
                    </Button>
                  </div>
                  
                  {assignment.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Study Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-2xl font-bold">Study Groups</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 sm:w-64"
              />
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Study Group</DialogTitle>
                    <DialogDescription>
                      Start a new study group for collaborative learning.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="group-name">Group Name *</Label>
                      <Input
                        id="group-name"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter group name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group-description">Description *</Label>
                      <Textarea
                        id="group-description"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the group's purpose and activities"
                      />
                    </div>
                    <div>
                      <Label htmlFor="group-subject">Subject *</Label>
                      <Input
                        id="group-subject"
                        value={newGroup.subject}
                        onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Enter subject"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateGroup} className="flex-1">
                        Create Group
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group, idx) => (
              <Card key={idx} className="p-6 card-hover">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold">{group.name}</h3>
                  <Badge variant="outline">{group.subject}</Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{group.members} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Next: {new Date(group.nextMeeting).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className={`flex-1 ${
                      joinedGroups.includes(idx) 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    }`}
                    onClick={() => handleJoinGroup(idx)}
                  >
                    {joinedGroups.includes(idx) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Joined
                      </>
                    ) : (
                      'Join Group'
                    )}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Opening group chat...')}
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Scheduling meeting...')}
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          <h2 className="text-2xl font-bold">Upcoming Exams</h2>
          
          <div className="space-y-4">
            {upcomingExams.map((exam, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{exam.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exam.date).toLocaleDateString()} at {exam.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-lg">{exam.duration}</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Opening study materials...')}
                  >
                    <BookOpen className="h-3 w-3 mr-1" />
                    Study Materials
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success('Finding study groups...')}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Study Group
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => {
                      const examDate = new Date(`${exam.date}T${exam.time}`);
                      const calendarEvent = {
                        title: `${exam.subject} Exam`,
                        start: examDate,
                        end: new Date(examDate.getTime() + parseInt(exam.duration) * 60 * 60 * 1000),
                        location: 'Examination Hall',
                        description: `Duration: ${exam.duration}`
                      };
                      const calendarUrl = generateCalendarUrl(calendarEvent);
                      window.open(calendarUrl, '_blank');
                      toast.success('Opening calendar...');
                    }}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Add to Calendar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleSetReminder(idx, 'exam', exam.date)}
                    className={reminders.includes(idx) ? 'bg-primary/10 text-primary' : ''}
                  >
                    <Bell className="h-3 w-3 mr-1" />
                    {reminders.includes(idx) ? 'Reminder Set' : 'Set Reminder'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
=======
            Canteen Pre-Order
          </span>
        </h1>
        <p className="text-muted-foreground">Skip the queue, order ahead!</p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <Wallet className="h-8 w-8 text-green-500 mb-2" />
          <p className="font-bold text-2xl">₹450</p>
          <p className="text-sm text-muted-foreground">Wallet Balance</p>
        </Card>
        
        <Card className="p-6">
          <Clock className="h-8 w-8 text-blue-500 mb-2" />
          <p className="font-bold text-2xl">{activeOrders.length}</p>
          <p className="text-sm text-muted-foreground">Active Orders</p>
        </Card>
        
        <Card className="p-6">
          <UtensilsCrossed className="h-8 w-8 text-orange-500 mb-2" />
          <p className="font-bold text-2xl">{cart.length}</p>
          <p className="text-sm text-muted-foreground">Items in Cart</p>
        </Card>
        
        <Card className="p-6">
          <CheckCircle2 className="h-8 w-8 text-purple-500 mb-2" />
          <p className="font-bold text-2xl">87</p>
          <p className="text-sm text-muted-foreground">Orders This Month</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Today's Menu</h2>
            
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                <TabsTrigger value="lunch">Lunch</TabsTrigger>
                <TabsTrigger value="snacks">Snacks</TabsTrigger>
                <TabsTrigger value="beverages">Beverages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {menuItems.map((item) => (
                  <Card key={item.id} className="p-4 hover:shadow-card transition-smooth">
                    <div className="flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold flex items-center gap-2">
                              {item.name}
                              {item.veg && <Leaf className="h-4 w-4 text-green-500" />}
                              {item.popular && <Flame className="h-4 w-4 text-orange-500" />}
                            </h3>
                            <p className="text-lg font-bold text-primary">₹{item.price}</p>
                          </div>
                          <Button size="sm" onClick={() => addToCart(item)}>
                            Add
                          </Button>
                        </div>
                        
                        <div className="flex gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {item.prepTime} mins
                          </span>
                          <span>{item.calories} cal</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Cart & Active Orders */}
        <div className="space-y-6">
          {/* Cart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Cart
              </h3>
              {cart.length > 0 && (
                <Badge>{cart.length}</Badge>
              )}
            </div>
            
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Cart is empty</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="font-bold">₹{item.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                  <Button className="w-full" onClick={placeOrder}>
                    Place Order
                  </Button>
                </div>
              </>
            )}
          </Card>
          
          {/* Active Orders */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Active Orders</h3>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <div 
                  key={order.tokenNo}
                  className={`p-4 rounded-lg border ${
                    order.status === 'ready' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Token #{order.tokenNo}</span>
                    <Badge variant={order.status === 'ready' ? 'default' : 'secondary'}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {order.items.join(', ')}
                  </p>
                  <p className="text-sm font-medium">{order.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
>>>>>>> f7ccad6083d2b24c2d5d6e8d417a075bda1d7b06
    </div>
  );
}
