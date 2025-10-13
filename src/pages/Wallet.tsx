import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  History,
  Download,
  Upload,
  QrCode,
  Smartphone,
  Banknote,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Gift,
  Award,
  Send,
  Receive,
  Copy,
  ExternalLink,
  Shield,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Wallet() {
  const { theme } = useTheme();
  const [balance, setBalance] = useState(450);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'UPI',
    name: '',
    details: ''
  });
  const [showBalance, setShowBalance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const transactions = [
    { 
      id: 1,
      type: 'credit',
      amount: 500,
      description: 'Wallet Top-up',
      date: '2025-01-15',
      time: '2:30 PM',
      status: 'completed',
      method: 'UPI'
    },
    { 
      id: 2,
      type: 'debit',
      amount: 60,
      description: 'Canteen - Masala Dosa',
      date: '2025-01-15',
      time: '12:15 PM',
      status: 'completed',
      method: 'Wallet'
    },
    { 
      id: 3,
      type: 'debit',
      amount: 120,
      description: 'Library Fine Payment',
      date: '2025-01-14',
      time: '4:45 PM',
      status: 'completed',
      method: 'Wallet'
    },
    { 
      id: 4,
      type: 'credit',
      amount: 50,
      description: 'Referral Bonus',
      date: '2025-01-12',
      time: '10:20 AM',
      status: 'completed',
      method: 'Reward'
    },
    { 
      id: 5,
      type: 'debit',
      amount: 200,
      description: 'Event Registration - Tech Fest',
      date: '2025-01-10',
      time: '3:15 PM',
      status: 'completed',
      method: 'Wallet'
    },
  ];
  
  const quickActions = [
    { 
      title: 'Add Money',
      icon: Plus,
      color: 'text-green-500',
      action: () => setShowAddMoney(true)
    },
    { 
      title: 'Send Money',
      icon: Send,
      color: 'text-blue-500',
      action: () => setShowSendMoney(true)
    },
    { 
      title: 'QR Payment',
      icon: QrCode,
      color: 'text-purple-500',
      action: () => handleQRPayment()
    },
    { 
      title: 'Pay Bills',
      icon: CreditCard,
      color: 'text-orange-500',
      action: () => toast.info('Bill payment feature coming soon!')
    },
  ];
  
  const paymentMethods = [
    { 
      type: 'UPI',
      name: 'Google Pay',
      last4: '1234',
      isDefault: true,
      icon: Smartphone
    },
    { 
      type: 'Card',
      name: 'Visa Card',
      last4: '5678',
      isDefault: false,
      icon: CreditCard
    },
    { 
      type: 'Bank',
      name: 'SBI Account',
      last4: '9012',
      isDefault: false,
      icon: Banknote
    },
  ];
  
  const rewards = [
    { 
      title: 'First Transaction',
      description: 'Complete your first payment to earn 50 points',
      points: 50,
      status: 'completed',
      icon: Star
    },
    { 
      title: 'Monthly Spender',
      description: 'Spend ₹1000+ this month to earn 100 points',
      points: 100,
      status: 'in_progress',
      progress: 65,
      icon: TrendingUp
    },
    { 
      title: 'Referral Master',
      description: 'Refer 5 friends to earn 250 points',
      points: 250,
      status: 'pending',
      icon: Gift
    },
  ];
  
  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount);
    if (amount > 0) {
      setIsProcessing(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBalance(prev => prev + amount);
      setAddAmount('');
      setShowAddMoney(false);
      setIsProcessing(false);
      toast.success(`₹${amount} added to wallet!`);
    } else {
      toast.error('Please enter a valid amount');
    }
  };
  
  const handleSendMoney = async () => {
    const amount = parseFloat(sendAmount);
    if (amount > 0 && amount <= balance && sendTo) {
      setIsProcessing(true);
      // Simulate transfer processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBalance(prev => prev - amount);
      setSendAmount('');
      setSendTo('');
      setShowSendMoney(false);
      setIsProcessing(false);
      toast.success(`₹${amount} sent to ${sendTo}!`);
    } else if (amount > balance) {
      toast.error('Insufficient balance');
    } else {
      toast.error('Please fill in all fields');
    }
  };
  
  const handleQRPayment = () => {
    setShowQRCode(true);
    toast.success('QR Code generated! Show this to the merchant.');
  };
  
  const handleAddPaymentMethod = () => {
    if (newPaymentMethod.name && newPaymentMethod.details) {
      toast.success('Payment method added successfully!');
      setNewPaymentMethod({ type: 'UPI', name: '', details: '' });
      setShowPaymentMethods(false);
    } else {
      toast.error('Please fill in all fields');
    }
  };
  
  const handleRefreshBalance = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    toast.success('Balance refreshed!');
  };
  
  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? ArrowDownLeft : ArrowUpRight;
  };
  
  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-500' : 'text-red-500';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className={theme === 'cyber' ? 'gradient-cyber bg-clip-text text-transparent' : ''}>
            Digital Wallet
          </span>
        </h1>
        <p className="text-muted-foreground">Manage your campus payments and transactions</p>
      </div>
      
      {/* Balance Card */}
      <Card className={`p-8 mb-8 ${theme === 'cyber' ? 'gradient-cyber' : 'bg-primary'} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg opacity-90">Available Balance</p>
            <p className="text-4xl font-bold">₹{balance}</p>
          </div>
          <Wallet className="h-12 w-12 opacity-80" />
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1"
            onClick={() => setShowAddMoney(true)}
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Money
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleQRPayment}
            disabled={isProcessing}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Pay
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleRefreshBalance}
            disabled={isProcessing}
          >
            <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>
      
      {/* Add Money Modal */}
      <Dialog open={showAddMoney} onOpenChange={setShowAddMoney}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
            <DialogDescription>
              Add funds to your digital wallet using your preferred payment method.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="mb-2"
              />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <select
                id="payment-method"
                className="w-full p-2 border rounded-md"
                defaultValue="upi"
              >
                <option value="upi">UPI</option>
                <option value="card">Credit/Debit Card</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Other Wallet</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleAddMoney} 
                className="flex-1"
                disabled={isProcessing || !addAmount}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Money
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowAddMoney(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Send Money Modal */}
      <Dialog open={showSendMoney} onOpenChange={setShowSendMoney}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Money</DialogTitle>
            <DialogDescription>
              Transfer money to another user or bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="send-to">Send To *</Label>
              <Input
                id="send-to"
                placeholder="Enter UPI ID, phone number, or email"
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="send-amount">Amount *</Label>
              <Input
                id="send-amount"
                type="number"
                placeholder="Enter amount"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSendMoney} 
                className="flex-1"
                disabled={isProcessing || !sendAmount || !sendTo}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Money
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowSendMoney(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* QR Code Modal */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>QR Code Payment</DialogTitle>
            <DialogDescription>
              Show this QR code to the merchant to make a payment.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center space-y-4">
            <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
              <QrCode className="h-32 w-32 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              QR Code will be generated for ₹{balance} payment
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowQRCode(false)} className="flex-1">
                Close
              </Button>
              <Button variant="outline" onClick={() => toast.success('QR Code saved to gallery!')}>
                <Download className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Card key={idx} className="p-6 card-hover cursor-pointer" onClick={action.action}>
              <Icon className={`h-8 w-8 mb-3 ${action.color}`} />
              <p className="font-bold">{action.title}</p>
            </Card>
          );
        })}
      </div>
      
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Transaction History</h2>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const Icon = getTransactionIcon(transaction.type);
              return (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <Icon className={`h-5 w-5 ${getTransactionColor(transaction.type)}`} />
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()} • {transaction.time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                      </p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        <span className="text-sm text-muted-foreground">{transaction.method}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Payment Methods</h2>
            <Dialog open={showPaymentMethods} onOpenChange={setShowPaymentMethods}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to your wallet.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="method-type">Payment Type</Label>
                    <select
                      id="method-type"
                      value={newPaymentMethod.type}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Card">Credit/Debit Card</option>
                      <option value="Bank">Bank Account</option>
                      <option value="Wallet">Digital Wallet</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="method-name">Name *</Label>
                    <Input
                      id="method-name"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter payment method name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="method-details">Details *</Label>
                    <Input
                      id="method-details"
                      value={newPaymentMethod.details}
                      onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, details: e.target.value }))}
                      placeholder="Enter UPI ID, card number, or account details"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddPaymentMethod} className="flex-1">
                      Add Method
                    </Button>
                    <Button variant="outline" onClick={() => setShowPaymentMethods(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-4">
            {paymentMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{method.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {method.type} • ****{method.last4}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success('Opening payment method editor...')}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(method.last4);
                          toast.success('Payment details copied!');
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Rewards & Points</h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">1,250</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {rewards.map((reward, idx) => {
              const Icon = reward.icon;
              return (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                    <Badge variant={
                      reward.status === 'completed' ? 'default' :
                      reward.status === 'in_progress' ? 'secondary' : 'outline'
                    }>
                      {reward.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {reward.status === 'in_progress' && reward.progress && (
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{reward.progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${reward.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-bold">{reward.points} points</span>
                    </div>
                    <Button size="sm" variant="outline">
                      {reward.status === 'completed' ? 'Claimed' : 'View Details'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Spending Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">₹1,250</p>
                </div>
              </div>
              <p className="text-sm text-green-600">+15% from last month</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Canteen</p>
                  <p className="text-2xl font-bold">₹680</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Most spent category</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                  <p className="text-2xl font-bold">₹85</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Per transaction</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
