import {

  useCallback,

  useEffect,

  useState,

} from "react";



import {

  Link,

  useNavigate,

} from "react-router-dom";



import {

  useForm,

} from "react-hook-form";



import {

  zodResolver,

} from "@hookform/resolvers/zod";



import {

  AlertCircle,

  ArrowRight,

  Bot,

  BrainCircuit,

  Eye,

  EyeOff,

  FileSearch,

  Lock,

  Mail,

  Sparkles,

} from "lucide-react";



import AuthLayout from "../../layouts/AuthLayout";



import Button from "../../components/ui/Button";

import Card from "../../components/ui/Card";

import Input from "../../components/ui/Input";

import Logo from "../../components/ui/Logo";



import {

  loginSchema,

  type LoginFormData,

} from "../../types/auth";



import {

  loginUser,

} from "../../services/authService";



import { useAuth } from "../../hooks/useAuth";



const features = [

  {

    icon: Bot,

    title: "Smart Document Analysis",

    description: "Understand PDFs instantly.",

  },

  {

    icon: FileSearch,

    title: "Semantic Search",

    description: "Find information in seconds.",

  },

  {

    icon: BrainCircuit,

    title: "Groq Powered AI Chat",

    description: "Lightning-fast intelligent responses.",

  },

] as const;



export default function LoginPage() {

  const navigate = useNavigate();



  const { login } = useAuth();



  const [showPassword, setShowPassword] =

    useState(false);



  const [serverError, setServerError] =

    useState("");



  const [mounted, setMounted] =

    useState(false);



  useEffect(() => {

    setMounted(true);

  }, []);



  const {

    register,

    handleSubmit,

    formState: {

      errors,

      isSubmitting,

    },

  } = useForm<LoginFormData>({

    resolver: zodResolver(loginSchema),

    mode: "onTouched",

  });



  const togglePassword =

    useCallback(() => {

      setShowPassword((prev) => !prev);

    }, []);



  const onSubmit = useCallback(

    async (data: LoginFormData) => {

      setServerError("");



      try {

        const response =

          await loginUser(data);



        await login(

          response.access_token

        );



        navigate("/dashboard", {

          replace: true,

        });

      } catch (err) {

        setServerError(

          err instanceof Error

            ? err.message

            : "Unable to sign in."

        );

      }

    },

    [login, navigate]

  );



  return (

    <AuthLayout>

      <div className="grid w-full items-center gap-y-14 lg:grid-cols-[3fr_2fr] lg:gap-x-16">



        {/* Left Hero */}



        <section

          className={`hidden transition-all duration-700 ease-out lg:block ${

            mounted

              ? "translate-x-0 opacity-100"

              : "-translate-x-6 opacity-0"

          }`}

        >

          <Logo size={52} />



          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">

            <Sparkles className="h-4 w-4" />

            Powered by Groq

          </div>



          <h1 className="mt-6 max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-foreground xl:text-6xl">

            Your documents,

            <span className="block bg-gradient-to-r from-primary via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">

              finally intelligent.

            </span>

          </h1>



          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">

            Upload, search, summarize, and chat

            with your documents using powerful AI

            — built for teams that move fast.

          </p>



          <div className="pointer-events-none mt-10 hidden max-w-md xl:block">

            <svg

              viewBox="0 0 420 220"

              fill="none"

              className="w-full text-primary"

            >

              <g

                opacity="0.25"

                stroke="currentColor"

                strokeWidth="1"

              >

                <line x1="60" y1="60" x2="180" y2="40" />

                <line x1="180" y1="40" x2="300" y2="70" />

                <line x1="300" y1="70" x2="360" y2="150" />

                <line x1="180" y1="40" x2="150" y2="150" />

                <line x1="150" y1="150" x2="60" y2="60" />

                <line x1="150" y1="150" x2="300" y2="70" />

                <line x1="150" y1="150" x2="260" y2="180" />

                <line x1="260" y1="180" x2="360" y2="150" />

              </g>



              <g fill="currentColor">

                <circle cx="60" cy="60" r="6" opacity="0.9" />

                <circle cx="180" cy="40" r="8" opacity="0.7" />

                <circle cx="300" cy="70" r="5" opacity="0.6" />

                <circle cx="360" cy="150" r="7" opacity="0.8" />

                <circle cx="150" cy="150" r="10" opacity="0.9" />

                <circle cx="260" cy="180" r="5" opacity="0.5" />

              </g>

            </svg>

          </div>



          <div className="mt-10 space-y-4">

            {features.map(

              (

                {

                  icon: Icon,

                  title,

                  description,

                },

                index

              ) => (

                <div

                  key={title}

                  style={{

                    transitionDelay: `${150 + index * 100}ms`,

                  }}

                  className={`flex items-center gap-4 transition-all duration-700 ease-out ${

                    mounted

                      ? "translate-y-0 opacity-100"

                      : "translate-y-3 opacity-0"

                  }`}

                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">

                    <Icon

                      className="h-5 w-5 text-primary"

                    />

                  </div>



                  <div>

                    <h3 className="text-sm font-semibold text-foreground">

                      {title}

                    </h3>



                    <p className="text-sm text-muted-foreground">

                      {description}

                    </p>

                  </div>

                </div>

              )

            )}

          </div>

        </section>



        {/* Right Login Card */}



        <section className="flex justify-center lg:justify-end">

          <Card

            className={`w-full max-w-lg rounded-3xl bg-card/70 p-8 shadow-2xl shadow-black/10 backdrop-blur-2xl transition-all duration-700 ease-out sm:p-10 ${

              mounted

                ? "translate-y-0 opacity-100"

                : "translate-y-4 opacity-0"

            }`}

          >

            <div className="mb-6 flex flex-col items-center lg:hidden">

              <Logo size={40} />

            </div>



            <div className="mb-7 text-center">

              <h2

                id="auth-title"

                className="text-3xl font-bold text-foreground sm:text-4xl"

              >

                Welcome back

              </h2>



              <p className="mt-2 text-muted-foreground">

                Sign in to continue to your workspace.

              </p>

            </div>



            {serverError && (

              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">

                <AlertCircle className="h-5 w-5 flex-shrink-0" />

                <span>{serverError}</span>

              </div>

            )}



            <form

              onSubmit={handleSubmit(onSubmit)}

              className="space-y-5"

            >

              <Input

                label="Email Address"

                type="email"

                autoComplete="email"

                placeholder="john@example.com"

                icon={<Mail className="h-5 w-5" />}

                error={errors.email?.message}

                {...register("email")}

              />



              <Input

                label="Password"

                type={

                  showPassword

                    ? "text"

                    : "password"

                }

                autoComplete="current-password"

                placeholder="Enter your password"

                icon={<Lock className="h-5 w-5" />}

                error={errors.password?.message}

                endAdornment={

                  <button

                    type="button"

                    onClick={togglePassword}

                    aria-label={

                      showPassword

                        ? "Hide password"

                        : "Show password"

                    }

                    className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"

                  >

                    {showPassword ? (

                      <EyeOff className="h-5 w-5" />

                    ) : (

                      <Eye className="h-5 w-5" />

                    )}

                  </button>

                }

                {...register("password")}

              />



              <div className="flex items-center justify-between pt-1 text-sm">

                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">

                  <input

                    type="checkbox"

                    className="h-4 w-4 rounded border-border accent-primary"

                  />

                  Remember me

                </label>



                <button

                  type="button"

                  className="font-medium text-primary transition hover:text-primary/80 hover:underline"

                >

                  Forgot password?

                </button>

              </div>



              <Button

                type="submit"

                loading={isSubmitting}

                iconRight={

                  <ArrowRight className="h-5 w-5" />

                }

                className="h-14 w-full rounded-2xl text-base font-semibold"

              >

                Sign In

              </Button>

            </form>



            <p className="mt-6 text-center text-sm text-muted-foreground">

              Don't have an account?



              <Link

                to="/register"

                className="ml-2 font-semibold text-primary transition hover:text-primary/80 hover:underline"

              >

                Create one

              </Link>

            </p>



            <div className="mt-6 flex items-center justify-center gap-2 border-t border-border/40 pt-5 text-xs text-muted-foreground">

              <Lock className="h-3.5 w-3.5" />



              <span>

                Encrypted document storage &

                AI processing

              </span>

            </div>

          </Card>

        </section>

      </div>

    </AuthLayout>

  );

}