import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth, useToast } from '@/providers';
import { usersApi } from '@/api';
import { getInitials } from '@/utils/format';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff, 
  Save, 
  AlertCircle,
  Camera,
  ArrowLeft
} from 'lucide-react';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/[0-9]/, 'Password must include at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character');

const adminProfileSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password !== "") {
        return data.password === data.password_confirmation;
      }
      return true;
    },
    {
      message: "Passwords do not match",
      path: ["password_confirmation"],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password !== "") {
        const res = passwordSchema.safeParse(data.password);
        return res.success;
      }
      return true;
    },
    {
      message: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      path: ["password"],
    }
  );

type AdminProfileFormData = z.infer<typeof adminProfileSchema>;

export function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors } 
  } = useForm<AdminProfileFormData>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: { 
      name: user?.name || '', 
      password: '',
      password_confirmation: ''
    },
  });

  const onSubmit = async (data: AdminProfileFormData) => {
    try {
      setLoading(true);
      const payload: { name: string; password?: string } = {
        name: data.name,
      };
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      const updated = await usersApi.updateProfile(payload);
      updateUser(updated);
      
      reset({
        name: updated.name,
        password: '',
        password_confirmation: ''
      });
      
      addToast('Profile updated successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhoto = async (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file', 'error');
      return;
    }

    try {
      setPhotoUploading(true);
      const updated = await usersApi.uploadProfilePhoto(file);
      updateUser(updated);
      addToast('Profile photo updated', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.message || 'Photo upload failed', 'error');
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <button 
        type="button" 
        onClick={() => navigate('/admin')} 
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Admin Profile Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your administrator credentials, update security keys, and manage settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Avatar Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <Card className="overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
            <div className="h-24 bg-gradient-to-r from-violet-600 to-indigo-600" />
            <CardContent className="relative pt-0 pb-6 text-center">
              <div className="flex justify-center -mt-12 mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-950 shadow-xl">
                    <AvatarImage src={user?.profile_photo_url || ''} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                      {user ? getInitials(user.name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    id="admin-profile-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      void handleProfilePhoto(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-lg"
                    disabled={photoUploading}
                    onClick={() => document.getElementById('admin-profile-photo')?.click()}
                    aria-label="Upload profile photo"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-950 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user?.email}</p>
              {photoUploading && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Uploading photo...</p>}
              
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-400">
                  <Shield className="w-3.5 h-3.5" />
                  System Administrator
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side: Settings Fields */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Details Card */}
            <Card className="border border-slate-100 dark:border-slate-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-violet-500" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your admin profile identity parameters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-profile-name">Full Name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="admin-profile-name"
                      placeholder="Admin Name" 
                      className="pl-9"
                      {...register('name')} 
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-profile-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      id="admin-profile-email"
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="pl-9 bg-slate-50 dark:bg-slate-900 cursor-not-allowed border-dashed"
                    />
                  </div>
                  <p className="text-xs text-slate-400">Email addresses are unique account identifiers and cannot be updated.</p>
                </div>
              </CardContent>
            </Card>

            {/* Security Passwords Card */}
            <Card className="border border-slate-100 dark:border-slate-800 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-violet-500" />
                  Security Settings
                </CardTitle>
                <CardDescription>Change your admin account password. Leave these blank to keep your current password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-profile-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="admin-profile-password"
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="New password" 
                        className="pl-9 pr-10"
                        {...register('password')} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-profile-password-confirmation">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        id="admin-profile-password-confirmation"
                        type={showConfirmPassword ? 'text' : 'password'} 
                        placeholder="Confirm password" 
                        className="pl-9 pr-10"
                        {...register('password_confirmation')} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg" className="px-6 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
