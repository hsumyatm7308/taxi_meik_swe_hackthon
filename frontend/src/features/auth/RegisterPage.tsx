import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Car,
  CalendarDays,
  Eye,
  EyeOff,
  Hash,
  IdCard,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerOwnerSchema,
  registerOwnerStepOneSchema,
  registerOwnerStepTwoSchema,
  registerDriverSchema,
  registerDriverStepOneSchema,
  registerDriverStepTwoSchema,
} from "@/utils/validation";
import { z } from "zod";
import { useAuth, useToast } from "@/providers";
import { MYANMAR_CITIES } from "@/constants";
import { cn } from "@/lib/utils";
import Logo from "@/assets/Logo.svg";

type Role = "owner" | "driver";
type Step = 1 | 2;

const glassInputClass =
  "h-12 border-white/15 bg-white/10 text-white placeholder:text-white/35 focus-visible:ring-white/40";

function RoleToggle({
  role,
  onChange,
}: {
  role: Role;
  onChange: (value: Role) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
      <button
        type="button"
        onClick={() => onChange("owner")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
          role === "owner"
            ? "bg-white text-slate-950 shadow-lg"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        <Car className="h-4 w-4" />
        Car Owner
      </button>
      <button
        type="button"
        onClick={() => onChange("driver")}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition",
          role === "driver"
            ? "bg-white text-slate-950 shadow-lg"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        <Users className="h-4 w-4" />
        Taxi Driver
      </button>
    </div>
  );
}

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="flex w-full gap-1">
      <div
        className={cn(
          "flex h-2 flex-1 rounded-full transition-colors",
          step >= 1 ? "bg-white" : "bg-white/20",
        )}
      />
      <div
        className={cn(
          "flex h-2 flex-1 rounded-full transition-colors",
          step >= 2 ? "bg-white" : "bg-white/20",
        )}
      />
    </div>
  );
}

function StepLabel({ step }: { step: Step }) {
  return (
    <div className="flex w-full justify-between text-xs text-white/75">
      <span className={cn(step === 1 && "font-medium text-white")}>Step 1</span>
      <span className={cn(step === 2 && "font-medium text-white")}>Step 2</span>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="w-full space-y-1">
      <ProgressBar step={step} />
      <StepLabel step={step} />
    </div>
  );
}

function OwnerStepOne({
  initialValues,
  onNext,
}: {
  initialValues: RegisterOwnerStepOneData;
  onNext: (values: RegisterOwnerStepOneData) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterOwnerStepOneData>({
    resolver: zodResolver(registerOwnerStepOneSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="owner-name" className="text-white/80">
          Fullname
        </Label>
        <div className="relative">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="owner-name"
            placeholder="Your full name"
            className={`pl-10 ${glassInputClass}`}
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-rose-200">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-email" className="text-white/80">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="owner-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className={`pl-10 ${glassInputClass}`}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-200">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-phone" className="text-white/80">
          Phone
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="owner-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0912345678"
            maxLength={12}
            className={`pl-10 ${glassInputClass}`}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-rose-200">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-password" className="text-white/80">
          Password
        </Label>
        <div className="relative">
          <Input
            id="owner-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className={`pr-12 ${glassInputClass}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-200">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-password-confirmation" className="text-white/80">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="owner-password-confirmation"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            className={`pr-12 ${glassInputClass}`}
            {...register("password_confirmation")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-xs text-rose-200">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>
      <StepIndicator step={1} />

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-white text-slate-950 shadow-lg hover:bg-slate-100"
      >
        Continue
      </Button>
    </form>
  );
}

function OwnerStepTwo({
  initialValues,
  loading,
  onBack,
  onSubmit,
}: {
  initialValues: RegisterOwnerStepTwoData;
  loading: boolean;
  onBack: () => void;
  onSubmit: (values: RegisterOwnerStepTwoData) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterOwnerStepTwoData>({
    resolver: zodResolver(registerOwnerStepTwoSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="owner-nrc" className="text-white/80">
            NRC Number
          </Label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="owner-nrc"
              placeholder="12/ABC(N)123456"
              className={`pl-10 ${glassInputClass}`}
              {...register("nrc_number")}
            />
          </div>
          {errors.nrc_number && (
            <p className="text-xs text-rose-200">{errors.nrc_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-city" className="text-white/80">
            City
          </Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`h-12 border-white/15 bg-white/10 text-white focus:ring-white/40 ${!field.value ? "text-white/35" : ""}`}
                >
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {MYANMAR_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && (
            <p className="text-xs text-rose-200">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner-township" className="text-white/80">
            Township
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="owner-township"
              placeholder="Township"
              className={`pl-10 ${glassInputClass}`}
              {...register("township")}
            />
          </div>
          {errors.township && (
            <p className="text-xs text-rose-200">{errors.township.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="owner-address" className="text-white/80">
          Address
        </Label>
        <textarea
          id="owner-address"
          rows={4}
          placeholder="Street, quarter, landmark"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
          {...register("address")}
        />
        {errors.address && (
          <p className="text-xs text-rose-200">{errors.address.message}</p>
        )}
      </div>
      <StepIndicator step={2} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-12 rounded-xl border border-white/15 bg-transparent text-white hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-white text-slate-950 shadow-lg hover:bg-slate-100"
        >
          {loading ? "Creating Account..." : "Create Owner Account"}
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function DriverStepOne({
  initialValues,
  onNext,
}: {
  initialValues: RegisterDriverStepOneData;
  onNext: (values: RegisterDriverStepOneData) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterDriverStepOneData>({
    resolver: zodResolver(registerDriverStepOneSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="driver-name" className="text-white/80">
          Fullname
        </Label>
        <div className="relative">
          <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="driver-name"
            placeholder="Your full name"
            className={`pl-10 ${glassInputClass}`}
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-xs text-rose-200">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-email" className="text-white/80">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="driver-email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            className={`pl-10 ${glassInputClass}`}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-200">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-phone" className="text-white/80">
          Phone
        </Label>
        <div className="relative">
          <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            id="driver-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="0912345678"
            maxLength={12}
            className={`pl-10 ${glassInputClass}`}
            {...register("phone")}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-rose-200">{errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-password" className="text-white/80">
          Password
        </Label>
        <div className="relative">
          <Input
            id="driver-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className={`pr-12 ${glassInputClass}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-rose-200">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-password-confirmation" className="text-white/80">
          Confirm Password
        </Label>
        <div className="relative">
          <Input
            id="driver-password-confirmation"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            className={`pr-12 ${glassInputClass}`}
            {...register("password_confirmation")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
            aria-label={
              showConfirmPassword
                ? "Hide confirm password"
                : "Show confirm password"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password_confirmation && (
          <p className="text-xs text-rose-200">
            {errors.password_confirmation.message}
          </p>
        )}
      </div>
      <StepIndicator step={1} />

      <Button
        type="submit"
        className="h-12 w-full rounded-xl bg-white text-slate-950 shadow-lg hover:bg-slate-100"
      >
        Continue
      </Button>
    </form>
  );
}

function DriverStepTwo({
  initialValues,
  loading,
  onBack,
  onSubmit,
}: {
  initialValues: RegisterDriverStepTwoData;
  loading: boolean;
  onBack: () => void;
  onSubmit: (values: RegisterDriverStepTwoData) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterDriverStepTwoData>({
    resolver: zodResolver(registerDriverStepTwoSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="driver-nrc" className="text-white/80">
            NRC Number
          </Label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="driver-nrc"
              placeholder="12/ABC(N)123456"
              className={`pl-10 ${glassInputClass}`}
              {...register("nrc_number")}
            />
          </div>
          {errors.nrc_number && (
            <p className="text-xs text-rose-200">{errors.nrc_number.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="driver-city" className="text-white/80">
            City
          </Label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`h-12 border-white/15 bg-white/10 text-white focus:ring-white/40 ${!field.value ? "text-white/35" : ""}`}
                >
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {MYANMAR_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && (
            <p className="text-xs text-rose-200">{errors.city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="driver-township" className="text-white/80">
            Township
          </Label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="driver-township"
              placeholder="Township"
              className={`pl-10 ${glassInputClass}`}
              {...register("township")}
            />
          </div>
          {errors.township && (
            <p className="text-xs text-rose-200">{errors.township.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="driver-license-number" className="text-white/80">
            License Number
          </Label>
          <div className="relative">
            <Hash className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="driver-license-number"
              placeholder="License number"
              className={`pl-10 ${glassInputClass}`}
              {...register("license_number")}
            />
          </div>
          {errors.license_number && (
            <p className="text-xs text-rose-200">
              {errors.license_number.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="driver-license-expiry" className="text-white/80">
            License Expiry
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="driver-license-expiry"
              type="date"
              className={`pl-10 ${glassInputClass}`}
              {...register("license_expiry")}
            />
          </div>
          {errors.license_expiry && (
            <p className="text-xs text-rose-200">
              {errors.license_expiry.message}
            </p>
          )}
        </div>

        <div className="space-y-2 sm:col-span-1">
          <Label htmlFor="driver-years-experience" className="text-white/80">
            Year of Experience
          </Label>
          <div className="relative">
            <Car className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <Input
              id="driver-years-experience"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              className={`pl-10 ${glassInputClass}`}
              {...register("years_experience", { valueAsNumber: true })}
            />
          </div>
          {errors.years_experience && (
            <p className="text-xs text-rose-200">
              {errors.years_experience.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="driver-address" className="text-white/80">
          Address
        </Label>
        <textarea
          id="driver-address"
          rows={4}
          placeholder="Street, quarter, landmark"
          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20"
          {...register("address")}
        />
        {errors.address && (
          <p className="text-xs text-rose-200">{errors.address.message}</p>
        )}
      </div>
      <StepIndicator step={2} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={onBack}
          className="h-12 rounded-xl border border-white/15 bg-transparent text-white hover:bg-white/10"
        >
          Previous
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-white text-slate-950 shadow-lg hover:bg-slate-100"
        >
          {loading ? "Creating Account..." : "Create Driver Account"}
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

type RegisterOwnerStepOneData = z.infer<typeof registerOwnerStepOneSchema>;
type RegisterOwnerStepTwoData = z.infer<typeof registerOwnerStepTwoSchema>;
type RegisterDriverStepOneData = z.infer<typeof registerDriverStepOneSchema>;
type RegisterDriverStepTwoData = z.infer<typeof registerDriverStepTwoSchema>;

function OwnerRegisterFlow() {
  const navigate = useNavigate();
  const { registerOwner } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [stepOneData, setStepOneData] = useState<RegisterOwnerStepOneData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [stepTwoData, setStepTwoData] = useState<RegisterOwnerStepTwoData>({
    nrc_number: "",
    address: "",
    city: "",
    township: "",
  });

  const handleStepOneNext = (values: RegisterOwnerStepOneData) => {
    setStepOneData(values);
    setStep(2);
  };

  const handleSubmit = async (values: RegisterOwnerStepTwoData) => {
    setLoading(true);
    try {
      const payload = registerOwnerSchema.safeParse({
        ...stepOneData,
        ...values,
      });
      if (!payload.success) {
        addToast(
          payload.error.issues[0]?.message || "Registration failed",
          "error",
        );
        return;
      }
      await registerOwner(payload.data);
      addToast("Account created successfully!", "success");
      navigate("/owner", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return step === 1 ? (
    <OwnerStepOne initialValues={stepOneData} onNext={handleStepOneNext} />
  ) : (
    <OwnerStepTwo
      initialValues={stepTwoData}
      loading={loading}
      onBack={() => setStep(1)}
      onSubmit={async (values) => {
        setStepTwoData(values);
        await handleSubmit(values);
      }}
    />
  );
}

function DriverRegisterFlow() {
  const navigate = useNavigate();
  const { registerDriver } = useAuth();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [stepOneData, setStepOneData] = useState<RegisterDriverStepOneData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });
  const [stepTwoData, setStepTwoData] = useState<RegisterDriverStepTwoData>({
    nrc_number: "",
    address: "",
    city: "",
    township: "",
    license_number: "",
    license_expiry: "",
    years_experience: 0,
  });

  const handleStepOneNext = (values: RegisterDriverStepOneData) => {
    setStepOneData(values);
    setStep(2);
  };

  const handleSubmit = async (values: RegisterDriverStepTwoData) => {
    setLoading(true);
    try {
      const payload = registerDriverSchema.safeParse({
        ...stepOneData,
        ...values,
      });
      if (!payload.success) {
        addToast(
          payload.error.issues[0]?.message || "Registration failed",
          "error",
        );
        return;
      }
      await registerDriver(payload.data);
      addToast("Account created successfully!", "success");
      navigate("/driver", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return step === 1 ? (
    <DriverStepOne initialValues={stepOneData} onNext={handleStepOneNext} />
  ) : (
    <DriverStepTwo
      initialValues={stepTwoData}
      loading={loading}
      onBack={() => setStep(1)}
      onSubmit={async (values) => {
        setStepTwoData(values);
        await handleSubmit(values);
      }}
    />
  );
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<Role>(
    searchParams.get("role") === "driver" ? "driver" : "owner",
  );

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-white/20 bg-white/10 shadow-[0_30px_120px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
        <CardHeader className="space-y-1 text-center">
          <img
            src={Logo}
            alt="Logo"
            className="mx-auto h-24 w-50 object-contain"
          />
          <CardTitle className="text-3xl text-white">
            Create your account
          </CardTitle>
          <CardDescription className="text-white/70">
            Pick your role and finish the form in two steps.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <RoleToggle role={role} onChange={setRole} />
          {role === "owner" ? (
            <OwnerRegisterFlow key="owner" />
          ) : (
            <DriverRegisterFlow key="driver" />
          )}

          <p className="text-center text-sm text-white/70">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-sky-200 transition hover:text-white hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default RegisterPage;
