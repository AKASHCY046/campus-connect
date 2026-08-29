// Enhanced chat API with improved intent detection and response generation
import appGuide from '@/lib/app_guide.json';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatResponse {
  reply: string;
  success: boolean;
  error?: string;
}

// Intent detection patterns
const intentPatterns = {
  // Library intents
  library: {
    borrow: ['borrow', 'issue', 'take', 'get book', 'checkout'],
    return: ['return', 'give back', 'submit book'],
    due: ['due date', 'deadline', 'when due', 'expire'],
    fine: ['fine', 'penalty', 'overdue', 'late fee'],
    reserve: ['reserve', 'book', 'hold', 'queue'],
    search: ['find book', 'search', 'look for', 'catalog']
  },
  // Canteen intents
  canteen: {
    order: ['order', 'pre-order', 'buy', 'purchase', 'get food'],
    menu: ['menu', 'food', 'what available', 'what to eat'],
    status: ['order status', 'where is my order', 'ready', 'pending'],
    payment: ['pay', 'payment', 'bill', 'cost']
  },
  // Academic intents
  academic: {
    materials: ['study materials', 'notes', 'resources', 'download'],
    assignment: ['assignment', 'homework', 'submit', 'due'],
    group: ['study group', 'group', 'collaborate', 'team'],
    forum: ['forum', 'discussion', 'ask question', 'help']
  },
  // Campus intents
  campus: {
    event: ['event', 'register', 'sign up', 'attend'],
    facility: ['book facility', 'reserve', 'room', 'lab'],
    announcement: ['announcement', 'news', 'update', 'notice'],
    service: ['service', 'help', 'support', 'contact']
  },
  // General intents
  general: {
    help: ['help', 'support', 'how to', 'guide'],
    role: ['what can i do', 'my role', 'permissions', 'access'],
    theme: ['theme', 'dark mode', 'light mode', 'appearance'],
    dashboard: ['dashboard', 'home', 'overview', 'main']
  }
};

// Enhanced response templates
const responseTemplates = {
  library: {
    borrow: `📚 **How to Borrow a Book:**

1. **Navigate to Library** - Click "Library" in the main navigation
2. **Browse Catalog** - Use search or browse available books
3. **Select Book** - Click on the book you want to borrow
4. **Scan QR Code** - Use the QR scanner or click "Issue Book"
5. **Confirmation** - You'll receive a confirmation with due date`,

    return: `📚 **How to Return a Book:**

1. **Go to Library** - Navigate to the Library section
2. **My Issued Books** - Click on "My Issued Books"
3. **Select Book** - Find the book you want to return
4. **Scan QR Code** - Use the QR scanner on the book
5. **Confirm Return** - System will process and update availability`,

    due: `📅 **Check Due Dates:**

1. **Library Section** - Go to the Library module
2. **My Issued Books** - View all your borrowed books
3. **Due Date Display** - Each book shows its due date
4. **Overdue Alert** - Red highlighting for overdue books`,

    fine: `💰 **Pay Library Fines:**

1. **Library Section** - Navigate to Library
2. **My Issued Books** - Check for overdue books
3. **Fine Display** - View calculated fines
4. **Pay Now** - Click "Pay Fine" button
5. **Payment Method** - Choose UPI, card, or digital wallet`,

    reserve: `📖 **Reserve a Book:**

1. **Library Section** - Go to Library
2. **Search Book** - Find the book you want
3. **Check Availability** - See if it's available or borrowed
4. **Reserve** - Click "Reserve" if unavailable
5. **Notification** - Get notified when book is available`
  },

  canteen: {
    order: `🍽️ **How to Pre-Order Food:**

1. **Canteen Section** - Click "Canteen" in navigation
2. **Browse Menu** - View available items with prices
3. **Select Items** - Choose food and quantities
4. **Add to Order** - Click "Pre-Order" button
5. **Payment** - Pay online or choose cash on pickup
6. **Track Order** - Monitor order status in real-time`,

    menu: `🍽️ **Canteen Menu:**

1. **Canteen Section** - Go to Canteen module
2. **Menu Tab** - View current available items
3. **Categories** - Filter by Main Course, Snacks, Beverages
4. **Availability** - Green = Available, Red = Out of Stock`,

    status: `📱 **Track Order Status:**

1. **Canteen Section** - Go to Canteen
2. **My Orders** - View all your orders
3. **Status Display** - See current status:
   • 🟡 **Pending** - Order received, being prepared
   • 🟢 **Ready** - Order ready for pickup
   • ✅ **Picked Up** - Order completed`
  },

  academic: {
    materials: `📚 **Download Study Materials:**

1. **Academic Section** - Go to Academic module
2. **Study Materials Tab** - Browse available resources
3. **Search/Filter** - Find materials by subject or topic
4. **Download** - Click download button
5. **Rate & Review** - Help others by rating materials`,

    assignment: `📝 **Submit Assignments:**

1. **Academic Section** - Navigate to Academic
2. **Assignments Tab** - View all assignments
3. **Select Assignment** - Click on assignment details
4. **Download Requirements** - Get assignment brief
5. **Upload Solution** - Submit your completed work
6. **Track Status** - Monitor submission and grades`,

    group: `👥 **Join Study Groups:**

1. **Academic Section** - Go to Academic module
2. **Study Groups Tab** - Browse available groups
3. **Filter by Subject** - Find relevant groups
4. **Join Group** - Click "Join Group" button
5. **Participate** - Attend meetings and collaborate`,

    forum: `💬 **Academic Forums:**

1. **Academic Section** - Navigate to Academic
2. **Forums Tab** - View discussion topics
3. **Browse Topics** - Find relevant discussions
4. **Ask Questions** - Post your queries
5. **Help Others** - Answer questions and share knowledge`
  },

  campus: {
    event: `🎉 **Register for Campus Events:**

1. **Campus Section** - Go to Campus module
2. **Events Tab** - Browse upcoming events
3. **Event Details** - Click on event for more info
4. **Register** - Click "Register Now" button
5. **Confirmation** - Receive registration confirmation`,

    facility: `🏢 **Book Campus Facilities:**

1. **Campus Section** - Navigate to Campus
2. **Facilities Tab** - View available facilities
3. **Check Availability** - See available time slots
4. **Select Time** - Choose your preferred slot
5. **Book Now** - Confirm your booking
6. **Get Confirmation** - Receive booking details`,

    announcement: `📢 **Campus Announcements:**

1. **Campus Section** - Go to Campus module
2. **Announcements Tab** - View all announcements
3. **Priority Levels** - High, Medium, Low priority
4. **Mark as Read** - Click to mark announcements as read
5. **Filter** - Sort by category or date`
  },

  general: {
    help: `🆘 **Campus Connect Help:**

I can help you with:

📚 **Library Services** - Borrow/return books, check due dates, pay fines
🍽️ **Canteen Pre-Ordering** - View menu, place orders, track status
🎓 **Academic Resources** - Download materials, submit assignments, study groups
🏫 **Campus Services** - Register for events, book facilities, announcements
⚙️ **General Features** - Dashboard, themes, permissions

**What would you like help with?**`,

    role: `👤 **Your Role & Permissions:**

**Student:** Library, Canteen, Academic, Campus access
**Professor:** Academic materials, assignments, faculty dashboard
**Librarian:** Library management, inventory, returns, fines
**Canteen Staff:** Menu updates, order processing, payments
**Admin:** Full system access, user management, analytics`,

    theme: `🎨 **Change Theme:**

1. **Navigation Bar** - Look for the theme toggle button
2. **Click Toggle** - Switch between Classic and Cyber themes
3. **Automatic Save** - Your preference is saved automatically
4. **Instant Apply** - Theme changes immediately`,

    dashboard: `🏠 **Dashboard Overview:**

Your Dashboard provides:

**Quick Stats** - Books issued, assignments due, events, points
**Quick Actions** - Direct access to all modules
**Recent Activity** - Library, canteen, academic, campus activity
**Notifications** - Due dates, order updates, announcements`
  }
};

// Enhanced keyword matching with intent detection
const detectIntent = (message: string): { module: string; action: string; confidence: number } | null => {
  const lowerMessage = message.toLowerCase();
  let bestMatch = { module: '', action: '', confidence: 0 };

  for (const [module, actions] of Object.entries(intentPatterns)) {
    for (const [action, keywords] of Object.entries(actions)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword));
      const confidence = matches.length / keywords.length;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { module, action, confidence };
      }
    }
  }

  return bestMatch.confidence > 0.3 ? bestMatch : null;
};

// Generate contextual response
const generateResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings
  if (lowerMessage.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
    return `Hello! 👋 I'm your Campus Connect assistant. I can help you with library services, canteen pre-ordering, academic resources, campus events, and more. What would you like to know about?`;
  }

  // Detect intent and generate response
  const intent = detectIntent(message);
  if (intent && responseTemplates[intent.module as keyof typeof responseTemplates]) {
    const moduleTemplates = responseTemplates[intent.module as keyof typeof responseTemplates];
    if (moduleTemplates[intent.action as keyof typeof moduleTemplates]) {
      return moduleTemplates[intent.action as keyof typeof moduleTemplates];
    }
  }

  // Check for specific keywords with improved matching
  const keywordResponses = {
    // Library keywords
    'library': responseTemplates.library.borrow,
    'book': responseTemplates.library.borrow,
    'borrow': responseTemplates.library.borrow,
    'return': responseTemplates.library.return,
    'due date': responseTemplates.library.due,
    'fine': responseTemplates.library.fine,
    'reserve': responseTemplates.library.reserve,
    
    // Canteen keywords
    'canteen': responseTemplates.canteen.order,
    'food': responseTemplates.canteen.menu,
    'order': responseTemplates.canteen.order,
    'menu': responseTemplates.canteen.menu,
    'status': responseTemplates.canteen.status,
    
    // Academic keywords
    'academic': responseTemplates.academic.materials,
    'study': responseTemplates.academic.materials,
    'assignment': responseTemplates.academic.assignment,
    'group': responseTemplates.academic.group,
    'forum': responseTemplates.academic.forum,
    
    // Campus keywords
    'campus': responseTemplates.campus.event,
    'event': responseTemplates.campus.event,
    'facility': responseTemplates.campus.facility,
    'announcement': responseTemplates.campus.announcement,
    
    // General keywords
    'help': responseTemplates.general.help,
    'role': responseTemplates.general.role,
    'permission': responseTemplates.general.role,
    'theme': responseTemplates.general.theme,
    'dashboard': responseTemplates.general.dashboard,
    'home': responseTemplates.general.dashboard
  };

  // Find best keyword match
  for (const [keyword, response] of Object.entries(keywordResponses)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }

  // Check for out-of-scope queries
  const outOfScopeKeywords = ['weather', 'news', 'sports', 'politics', 'cooking', 'travel', 'movie', 'music', 'recipe', 'stock', 'crypto'];
  if (outOfScopeKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return `I can help only with Campus Connect-related queries. Please ask me about library services, canteen pre-ordering, academic resources, campus events, or other Campus Connect features.`;
  }

  // Default helpful response
  return `I'm here to help with Campus Connect! You can ask me about:

📚 **Library** - Borrow/return books, QR codes, due dates, fines
🍽️ **Canteen** - Pre-order meals, view menu, track orders
🎓 **Academic** - Study materials, assignments, study groups
🏫 **Campus** - Events, facilities, announcements
⚙️ **General** - Dashboard, themes, permissions

**What would you like to know about?**`;
};

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

  try {
    const reply = generateResponse(message);
    return {
      reply,
      success: true,
    };
  } catch (error) {
    console.error('Chat error:', error);
    return {
      reply: 'Sorry, I encountered an error. Please try again.',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
