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

    title: "Make sense of long files",

    description: "Get to the important parts faster.",

  },

  {

    icon: FileSearch,

    title: "Find the detail you remember",

    description: "Search by meaning, not just filenames.",

  },

  {

    icon: BrainCircuit,

    title: "Ask your documents",

    description: "Get a useful answer with its context.",

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

            A little less digging

          </div>



          <h1 className="mt-6 max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-foreground xl:text-6xl">

            Your work,

            <span className="block bg-gradient-to-r from-[#F4F3F0] via-[#DA7B93] to-[#9BC8B5] bg-clip-text text-transparent">

              a little clearer.

            </span>

          </h1>



          <p className="mt-5 max-w-md text-lg leading-8 text-muted-foreground">

            Keep your PDFs and notes in one place. Search for the detail you need, or ask a question when opening every file feels like too much.

          </p>



          <figure className="auth-art-frame mt-9 hidden max-w-lg xl:block">
            <img
              src="/images/fluid-sculpture.svg"
              alt="An abstract fluid sculpture in rose, lavender and deep blue"
              className="auth-art-image"
              loading="eager"
              decoding="async"
            />
            <figcaption className="auth-art-caption">
              A calmer way to work with your documents.
            </figcaption>
          </figure>



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

                className="auth-primary-button h-14 w-full rounded-2xl text-base font-semibold"

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