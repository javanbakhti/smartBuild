import React, { useState, useEffect } from 'react';
    import { Link, useNavigate, useLocation } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Checkbox } from '@/components/ui/checkbox';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { UserPlus, Eye, EyeOff, Building, Phone, Users } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const MemberSignUp = ({ setUser }) => {
      const navigate = useNavigate();
      const location = useLocation();
      const { toast } = useToast();

      const [fullName, setFullName] = useState('');
      const [nickname, setNickname] = useState('');
      const [email, setEmail] = useState('');
      const [phoneNumber, setPhoneNumber] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      
      const [referralCode, setReferralCode] = useState(''); 
      const [unitNumber, setUnitNumber] = useState('');
      const [residentId, setResidentId] = useState('');
      const [buildingUid, setBuildingUid] = useState('');
      
      const [showPassword, setShowPassword] = useState(false);
      const [showConfirmPassword, setShowConfirmPassword] = useState(false);
      const [acceptedTerms, setAcceptedTerms] = useState(false);
      const [receiveUpdates, setReceiveUpdates] = useState(false);
      const [receivePromotions, setReceivePromotions] = useState(false);
      const [loading, setLoading] = useState(false);

      const [isEmailEditable, setIsEmailEditable] = useState(true);
      const [isUnitEditable, setIsUnitEditable] = useState(true);


      useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const refCode = queryParams.get('referralCode');
        const prefillEmail = queryParams.get('email');
        const prefillName = queryParams.get('name');
        const prefillUnit = queryParams.get('unitNumber');
        const prefillResidentId = queryParams.get('residentId');
        const prefillBuildingUid = queryParams.get('buildingUid');
        const prefillPhoneNumber = queryParams.get('phoneNumber');


        if (refCode) setReferralCode(refCode);
        if (prefillEmail) {
          setEmail(prefillEmail);
          setIsEmailEditable(false);
        }
        if (prefillName) setFullName(prefillName);
        if (prefillUnit) {
          setUnitNumber(prefillUnit);
          setIsUnitEditable(false); 
        }
        if (prefillResidentId) setResidentId(prefillResidentId);
        if (prefillBuildingUid) setBuildingUid(prefillBuildingUid);
        if (prefillPhoneNumber) setPhoneNumber(prefillPhoneNumber);

      }, [location.search]);


      const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!acceptedTerms) {
          toast({ title: 'Sign Up Error', description: 'You must accept the Terms of Use and Privacy Policy.', variant: 'destructive'});
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: 'Sign Up Error', description: 'Passwords do not match.', variant: 'destructive'});
          setLoading(false);
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));

        const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
        const residentMembersKey = `residentMembers_${residentId}`;
        const unitMembers = JSON.parse(localStorage.getItem(residentMembersKey)) || [];

        const existingUser = storedUsers.find(user => user.email === email);
        if (existingUser) {
          toast({ title: 'Sign Up Failed', description: 'An account with this email already exists.', variant: 'destructive'});
          setLoading(false);
          return;
        }
        
        let canProceedWithSignup = false;
        let matchedInvite = null;

        if (referralCode && residentId) {
            matchedInvite = unitMembers.find(inv => inv.referralCode === referralCode && inv.email === email);
            if (matchedInvite) {
                if (matchedInvite.status === 'active' || matchedInvite.status === 'signed_up') {
                    toast({ title: 'Sign Up Error', description: 'This invitation has already been used.', variant: 'destructive'});
                    setLoading(false);
                    return;
                }
                canProceedWithSignup = true;
            } else {
                toast({ title: 'Sign Up Error', description: 'Invalid referral code or email mismatch for this member invitation.', variant: 'destructive'});
                setLoading(false);
                return;
            }
        } else {
            toast({ title: 'Sign Up Error', description: 'A valid member invitation referral code is required.', variant: 'destructive'});
            setLoading(false);
            return;
        }

        if(canProceedWithSignup){
            const finalUnitNumber = matchedInvite?.unitNumber || unitNumber;
            const finalBuildingUid = matchedInvite?.buildingUid || buildingUid;
            const finalFloorNumber = matchedInvite?.floorNumber || "N/A"; // Get from invite if available

            const newMemberUser = {
                id: `user_member_${Date.now()}`,
                fullName,
                nickname,
                email,
                phoneNumber,
                password, 
                role: 'member', // Specific role for members
                referralCode: matchedInvite?.referralCode || referralCode,
                unitNumber: finalUnitNumber,
                floorNumber: finalFloorNumber,
                buildingUid: finalBuildingUid,
                residentId: residentId, // Link to the inviting resident
                status: 'active', 
                acceptedTerms,
                newsletter: {
                  updates: receiveUpdates,
                  promotions: receivePromotions,
                },
            };
            storedUsers.push(newMemberUser);
            localStorage.setItem('users', JSON.stringify(storedUsers));

            // Update the member's status in the resident's member list
            if (matchedInvite) {
                const updatedUnitMembers = unitMembers.map(inv => 
                    inv.id === matchedInvite.id ? { ...inv, status: 'active', userId: newMemberUser.id, dateSignedUp: new Date().toISOString() } : inv
                );
                localStorage.setItem(residentMembersKey, JSON.stringify(updatedUnitMembers));
            }
            
            // For members, we might not set them as the primary 'user' in localStorage
            // if they always operate under the context of a logged-in resident.
            // Or, if members can log in independently, then:
            // localStorage.setItem('user', JSON.stringify(newMemberUser)); 
            // setUser(newMemberUser);

            toast({ title: 'Sign Up Successful!', description: `Welcome, ${nickname || fullName}! Your member account is ready.`});
            // Redirect to resident login, or a page confirming signup and instructing to log in via resident.
            navigate('/login/resident'); 
        }
        setLoading(false);
      };


      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 p-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Card className="w-full max-w-lg glassmorphism-card border-teal-500/30 shadow-teal-500/20 shadow-2xl">
              <CardHeader className="text-center">
                <Link to="/" className="inline-block mb-4">
                  <Users className="w-16 h-16 mx-auto text-teal-400 hover:text-teal-300 transition-colors" />
                </Link>
                <CardTitle className="text-3xl font-bold text-white">Member Sign Up</CardTitle>
                <CardDescription className="text-teal-300">
                  Activate your household member account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="fullName" className="text-teal-300">Full Name</Label>
                      <Input id="fullName" placeholder="Jamie Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400" disabled={loading} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="nickname" className="text-teal-300">Nickname (Optional)</Label>
                      <Input id="nickname" placeholder="Jay" value={nickname} onChange={(e) => setNickname(e.target.value)} className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400" disabled={loading} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-teal-300">Email Address</Label>
                      <Input id="email" type="email" placeholder="member@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400" disabled={loading || !isEmailEditable} readOnly={!isEmailEditable} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phoneNumber" className="text-teal-300">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400/70" />
                        <Input id="phoneNumber" type="tel" placeholder="+1-555-123-4567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400 pl-10" disabled={loading || !isEmailEditable} readOnly={!isEmailEditable} />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 relative">
                      <Label htmlFor="password" className="text-teal-300">Password</Label>
                      <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400 pr-10" disabled={loading} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute bottom-0 right-0 px-3 py-2 text-teal-400 hover:text-teal-300" disabled={loading}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <div className="space-y-1 relative">
                      <Label htmlFor="confirmPassword" className="text-teal-300">Confirm Password</Label>
                      <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400 pr-10" disabled={loading} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute bottom-0 right-0 px-3 py-2 text-teal-400 hover:text-teal-300" disabled={loading}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                   <div className="space-y-1">
                    <Label htmlFor="referralCode" className="text-teal-300">Invitation Code</Label>
                    <Input id="referralCode" placeholder="Enter invitation code" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="bg-slate-800/50 border-teal-500/50 text-white placeholder-teal-400/70 focus:border-teal-400" disabled={loading || !isEmailEditable} readOnly={!isEmailEditable} />
                    {!isEmailEditable && <p className="text-xs text-teal-400">This code is from your invitation.</p>}
                  </div>
                   <div className="space-y-1">
                        <Label htmlFor="unitNumberDisplay" className="text-teal-300">Your Unit Number</Label>
                        <Input id="unitNumberDisplay" value={unitNumber || "Via Invitation"} className="bg-slate-700/50 border-teal-600/50 text-gray-300" disabled={true} readOnly={true} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} className="border-teal-400 data-[state=checked]:bg-teal-500 data-[state=checked]:border-teal-500" disabled={loading} />
                      <Label htmlFor="terms" className="text-sm text-teal-300">
                        I accept the <a href="https://ipfy.ca/terms-of-service" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-200">Terms of Use</a> and <a href="https://ipfy.ca/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-teal-200">Privacy Policy</a>. (Required)
                      </Label>
                    </div>
                     <div className="flex items-start space-x-2">
                        <Checkbox id="receiveUpdates" checked={receiveUpdates} onCheckedChange={setReceiveUpdates} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="receiveUpdates" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-teal-300">Receive Updates</Label>
                            <p className="text-xs text-muted-foreground text-teal-400">Get system news and announcements.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-2">
                        <Checkbox id="receivePromotions" checked={receivePromotions} onCheckedChange={setReceivePromotions} />
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="receivePromotions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-teal-300">Receive Promotions</Label>
                            <p className="text-xs text-muted-foreground text-teal-400">Get special offers and deals.</p>
                        </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 neumorphism-button border-none" disabled={loading || !acceptedTerms}>
                    {loading ? 'Activating Account...' : <><UserPlus className="mr-2 h-5 w-5" /> Activate Member Account</>}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col items-center space-y-2">
                <p className="text-sm text-teal-300">
                  Are you the primary resident?{' '}
                  <Link to="/login/resident" className="font-medium text-teal-200 hover:text-teal-100 hover:underline">
                    Resident Login
                  </Link>
                </p>
                 <Link to="/" className="text-sm text-teal-300 hover:text-teal-200 hover:underline">
                  Back to Home
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      );
    };

    export default MemberSignUp;