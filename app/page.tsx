"use client"

import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  ListTodo,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  X,
  TrendingUp,
  Award,
  Terminal,
  Calendar,
  Youtube,
  FileCode,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Target,
  Compass,
  Layers,
  CheckSquare
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CURRICULUM = [
  { day: 1, week: 1, title: 'Project Setup', isLab: false },
  { day: 2, week: 1, title: 'Homepage UI', isLab: false },
  { day: 3, week: 1, title: 'Git Workflow Lab', isLab: true },
  { day: 4, week: 1, title: 'Prompt Playground', isLab: false },
  { day: 5, week: 1, title: 'Gemini API', isLab: false },
  { day: 6, week: 1, title: 'Python Env Lab', isLab: true },
  { day: 7, week: 1, title: 'Chat Memory', isLab: false },
  { day: 8, week: 2, title: 'Markdown Output', isLab: false },
  { day: 9, week: 2, title: 'Export Chat', isLab: false },
  { day: 10, week: 2, title: 'REST API Lab', isLab: true },
  { day: 11, week: 2, title: 'Prompt Library', isLab: false },
  { day: 12, week: 2, title: 'Search History', isLab: false },
  { day: 13, week: 2, title: 'Linux CLI Lab', isLab: true },
  { day: 14, week: 2, title: 'Weekly Review', isLab: false },
  { day: 15, week: 3, title: 'PDF Upload', isLab: false },
  { day: 16, week: 3, title: 'Text Extraction', isLab: false },
  { day: 17, week: 3, title: 'Debugging Lab', isLab: true },
  { day: 18, week: 3, title: 'Chunking', isLab: false },
  { day: 19, week: 3, title: 'Embeddings', isLab: false },
  { day: 20, week: 3, title: 'Firebase Lab', isLab: true },
  { day: 21, week: 3, title: 'Weekly Review', isLab: false },
  { day: 22, week: 4, title: 'Vector Search', isLab: false },
  { day: 23, week: 4, title: 'RAG Chat', isLab: false },
  { day: 24, week: 4, title: 'Docker Lab', isLab: true },
  { day: 25, week: 4, title: 'Source Citation', isLab: false },
  { day: 26, week: 4, title: 'Settings', isLab: false },
  { day: 27, week: 4, title: 'Deployment Lab', isLab: true },
  { day: 28, week: 4, title: 'Weekly Review', isLab: false },
  { day: 29, week: 5, title: 'Authentication', isLab: false },
  { day: 30, week: 5, title: 'Chat Storage', isLab: false },
  { day: 31, week: 5, title: 'Database Lab', isLab: true },
  { day: 32, week: 5, title: 'Notes', isLab: false },
  { day: 33, week: 5, title: 'Export PDF', isLab: false },
  { day: 34, week: 5, title: 'Testing Lab', isLab: true },
  { day: 35, week: 5, title: 'Weekly Review', isLab: false },
  { day: 36, week: 6, title: 'Voice Input', isLab: false },
  { day: 37, week: 6, title: 'Image Input', isLab: false },
  { day: 38, week: 6, title: 'GitHub Actions', isLab: true },
  { day: 39, week: 6, title: 'Portfolio Polish', isLab: false },
  { day: 40, week: 6, title: 'Interview Prep', isLab: false },
  { day: 41, week: 6, title: 'Release Candidate', isLab: false },
  { day: 42, week: 6, title: 'v1.0 Release', isLab: false },
  { day: 43, week: 6, title: 'Career Launch & Next Steps', isLab: false },
];

const TOTAL_DAYS = CURRICULUM.length;
const TOTAL_LABS = CURRICULUM.filter(d => d.isLab).length;

interface Concept {
  name: string;
  whatIsIt: string;
  whyToday: string;
  realWorld: string[];
  howItWorks: string;
  whatWeBuild: string;
}

interface Step {
  title: string;
  explanation: string;
}

interface FileDesc {
  name: string;
  whyExists: string;
  proContext: string;
}

interface Video {
  title: string;
  channel: string;
  duration: string;
  url: string;
  whyWatch: string;
}

interface HandbookData {
  goal: string;
  context: {
    buildingToday: string;
    whyNeeded: string;
    connectionYesterday: string;
    connectionTomorrow: string;
  };
  concepts: Concept[];
  files: FileDesc[];
  steps: Step[];
  mistakes: string[];
  goodToKnow: {
    topic: string;
    tools: string[];
    whyPostponed: string;
  };
  videos: Video[];
  endOfDay: {
    accomplished: string;
    capability: string;
    tomorrow: string;
  };
}

const getHandbookContent = (day: number): HandbookData => {
  const meta = CURRICULUM.find(d => d.day === day) || CURRICULUM[0];
  if (day === 1) {
    return {
      goal: "Project Setup & The Modern Web Ecosystem",
      context: {
        buildingToday: "Today, we are setting up the blank canvas for our entire application. We aren't writing features yet; we are building the factory that will compile our code.",
        whyNeeded: "A web application isn't just a single HTML file anymore. We need tools to bundle our code, start a local server, and handle dependencies.",
        connectionYesterday: "This is Day 1. There is no yesterday. We are starting from absolute scratch.",
        connectionTomorrow: "Tomorrow, we will use this exact workspace to build our very first user interface. Without today's setup, tomorrow's code has nowhere to run."
      },
      concepts: [
        {
          name: "Package Managers (npm/pnpm)",
          whatIsIt: "A package manager is like an App Store for code. It allows you to download code that other developers have written (like React or Tailwind) instead of writing everything yourself.",
          whyToday: "We need a package manager today to download the core tools required to build a React application.",
          realWorld: [
            "Downloading a date-picker calendar so you don't have to code calendar logic.",
            "Installing Stripe's code to process payments.",
            "Fetching UI components like buttons and modals."
          ],
          howItWorks: "You type a command in your terminal -> The package manager contacts a central registry on the internet -> It downloads the requested code -> It saves it in a folder called 'node_modules' -> It logs the exact version in a file called 'package.json'.",
          whatWeBuild: "We will use npm to install our initial project scaffold."
        }
      ],
      files: [
        {
          name: "package.json",
          whyExists: "This file is the ID card of your project. It lists your project's name, version, and exactly which external packages it relies on.",
          proContext: "Professionals never share the heavy 'node_modules' folder. They just share 'package.json'. When a new developer joins, they run 'npm install', and this file tells the package manager exactly what to download."
        }
      ],
      steps: [
        {
          title: "Step 1: Open your terminal and verify Node.js is installed.",
          explanation: "Node.js is the engine that runs JavaScript on your computer (outside of a browser). Type `node -v`. If a version number appears, you are ready. If not, you need to download Node.js first."
        },
        {
          title: "Step 2: Run the Vite project creation command.",
          explanation: "Type `npm create vite@latest ai-workspace -- --template react-ts`. What is Vite? It's a build tool. It sets up a lightning-fast development server and configures React for us instantly."
        },
        {
          title: "Step 3: Navigate into the folder and install dependencies.",
          explanation: "Type `cd ai-workspace` and then `npm install`. The first command moves your terminal into the new folder. The second reads the 'package.json' file Vite created and downloads all the required code into 'node_modules'."
        }
      ],
      mistakes: [
        "Running `npm install` before typing `cd ai-workspace`. (You must be inside the project folder for the package manager to find the package.json file).",
        "Deleting the package.json file thinking it's unnecessary configuration.",
        "Committing the massive node_modules folder to GitHub (we'll cover how to prevent this with .gitignore later)."
      ],
      goodToKnow: {
        topic: "Alternative Build Tools",
        tools: ["Webpack", "Turbopack", "Parcel"],
        whyPostponed: "Vite is currently the industry standard for new React projects because it is incredibly fast. Older projects use Webpack, which requires complex configuration files. You don't need to worry about complex build configurations yet; Vite handles it automatically."
      },
      videos: [
        {
          title: "What is NPM, and why do we need it?",
          channel: "Programming with Mosh",
          duration: "12 min",
          url: "https://youtube.com",
          whyWatch: "Before running terminal commands blindly, this video explains exactly what happens when you hit 'Enter' on an npm install command."
        }
      ],
      endOfDay: {
        accomplished: "You initialized a modern web development environment.",
        capability: "You now have a local web server running on your machine that instantly updates whenever you save a file.",
        tomorrow: "We will delete the boilerplate code and build our own custom Homepage UI."
      }
    };
  }

  if (day === 2) {
    return {
      goal: "Homepage UI & React Fundamentals",
      context: {
        buildingToday: "Today, we are building the visual structure of our application—the sidebar, the main content area, and the header.",
        whyNeeded: "Users need a graphical interface to interact with our AI. A blank screen is useless.",
        connectionYesterday: "Yesterday we set up the server. Today we are writing the code that the server displays.",
        connectionTomorrow: "Tomorrow we will learn how to save this code to GitHub so we don't lose it. But we need code worth saving first."
      },
      concepts: [
        {
          name: "React Components",
          whatIsIt: "A component is a reusable piece of the user interface. Think of it like a custom LEGO block.",
          whyToday: "Instead of writing one massive, confusing HTML file, we will break our Homepage into smaller, manageable blocks (Sidebar, Header, Main).",
          realWorld: [
            "The 'Like' button on Twitter is a single component used everywhere.",
            "A product card on Amazon.",
            "The navigation menu on Netflix."
          ],
          howItWorks: "You write a JavaScript function that returns HTML-like syntax (called JSX). You can then use this function like a custom HTML tag (e.g., <MyButton />) anywhere in your app.",
          whatWeBuild: "We will build a `<Sidebar />` component and a `<Dashboard />` component."
        }
      ],
      files: [
        {
          name: "App.tsx",
          whyExists: "This is the root component. It acts as the container for every other component in your application.",
          proContext: "Professionals keep App.tsx very clean. It usually just handles layout structure and routing, delegating the actual UI details to specific component files."
        },
        {
          name: "components/Sidebar.tsx",
          whyExists: "We created a specific folder called 'components' to hold reusable UI parts. This keeps our project organized as it grows.",
          proContext: "In an enterprise app, the components folder might contain hundreds of files, often grouped by domain (e.g., components/auth, components/dashboard)."
        }
      ],
      steps: [
        {
          title: "Step 1: Delete the Vite boilerplate.",
          explanation: "Open `App.tsx` and delete everything inside the return statement. We don't want the default spinning React logo; we want a blank slate."
        },
        {
          title: "Step 2: Create a layout wrapper.",
          explanation: "Add a `<div>` with flexbox classes (`flex h-screen bg-white`). This forces our app to take up the full screen and sets up a side-by-side layout."
        },
        {
          title: "Step 3: Create the Sidebar component.",
          explanation: "Create a new file `Sidebar.tsx`. Write a function that returns a dark-colored vertical `<div>`. Import and place this `<Sidebar />` inside your `App.tsx`."
        }
      ],
      mistakes: [
        "Forgetting to `export default Sidebar` at the bottom of your component file, causing an import error in App.tsx.",
        "Returning multiple sibling elements without a parent wrapper (React requires a single parent element or a Fragment `<></>`).",
        "Using class instead of className (JSX requires className because 'class' is a reserved word in JavaScript)."
      ],
      goodToKnow: {
        topic: "CSS Modules & Styled Components",
        tools: ["Styled Components", "Emotion", "CSS Modules"],
        whyPostponed: "We are using Tailwind CSS for styling because it is fast and co-locates styles with layout. Other companies might use CSS-in-JS libraries. You don't need them today, but know they exist for scoping CSS."
      },
      videos: [
        {
          title: "React Components Explained",
          channel: "Fireship",
          duration: "100 Seconds",
          url: "https://youtube.com",
          whyWatch: "A rapid-fire, highly visual explanation of what a component is and why React forces you to think in components."
        }
      ],
      endOfDay: {
        accomplished: "You built a professional, responsive layout structure using React components.",
        capability: "Your application now has a permanent navigational structure and a content area ready to receive the AI features.",
        tomorrow: "We will introduce Git to version control this layout before we start adding complex logic."
      }
    };
  }

  if (day === 7) {
    return {
      goal: "Connect the AI Workspace to the Gemini API",
      context: {
        buildingToday: "Today, we are replacing our fake, static text with a real Large Language Model. We are building the bridge between our UI and Google's AI servers.",
        whyNeeded: "An AI application isn't an AI application until it can actually process prompts and return intelligent responses.",
        connectionYesterday: "Yesterday we set up the Python environment (or backend scaffolding) needed to handle secure requests.",
        connectionTomorrow: "Tomorrow, we will build a Markdown parser because the AI will return formatted text (like bolding and code blocks) that plain HTML can't render properly."
      },
      concepts: [
        {
          name: "REST APIs (Application Programming Interface)",
          whatIsIt: "An API is a messenger. It takes a request from your app, delivers it to another system (like Google's servers), and brings the response back to you.",
          whyToday: "Google doesn't let us download the Gemini AI model to our laptops (it's too massive). Instead, they provide an API. We send it a question, and it sends back the answer.",
          realWorld: [
            "A weather app on your phone uses an API to get data from a meteorological server.",
            "Logging in with 'Continue with Google' uses an API.",
            "Booking a flight uses APIs to check airline databases."
          ],
          howItWorks: "Your App creates a JSON object containing your prompt -> Sends an HTTP POST request over the internet -> Google verifies your API key -> Google's servers process the prompt -> Google sends back a JSON response -> Your App extracts the text and displays it.",
          whatWeBuild: "We will build a fetch function that triggers when the user clicks the 'Submit' button, sending the input text to the Gemini API."
        },
        {
          name: "Environment Variables (.env)",
          whatIsIt: "A hidden file that stores sensitive information like passwords or API keys.",
          whyToday: "To use the Gemini API, Google gives you a secret API Key. If you paste this directly into your code, anyone looking at your GitHub can steal it and use your account.",
          realWorld: [
            "Database passwords.",
            "Stripe payment secret keys.",
            "Third-party API tokens."
          ],
          howItWorks: "You create a file named literally `.env`. You write `VITE_GEMINI_API_KEY=12345`. Your code reads this file locally, but you tell Git to completely ignore the `.env` file so it never goes to the internet.",
          whatWeBuild: "We will generate a Gemini API key and store it securely."
        }
      ],
      files: [
        {
          name: ".env",
          whyExists: "To hold our secret Gemini API key locally.",
          proContext: "In a real company, developers never share .env files. Every developer creates their own local .env file. When deployed, these secrets are injected into the production server directly via a secure dashboard (like Vercel or AWS Secrets Manager)."
        },
        {
          name: "services/ai.ts",
          whyExists: "We are putting the logic that talks to Gemini in a separate file, away from the UI components.",
          proContext: "This is called 'Separation of Concerns'. UI components should only care about displaying things. Services should handle data fetching. If we decide to switch from Gemini to OpenAI tomorrow, we only have to change this one file, not the entire UI."
        }
      ],
      steps: [
        {
          title: "Step 1: Obtain your Gemini API Key.",
          explanation: "Go to Google AI Studio, create a new API key. Do not share this with anyone."
        },
        {
          title: "Step 2: Create a .env file.",
          explanation: "In the root of your project (same level as package.json), create a file named `.env`. Add `VITE_GEMINI_API_KEY=your_key_here`. Also, verify that `.env` is listed inside your `.gitignore` file."
        },
        {
          title: "Step 3: Create the API Service function.",
          explanation: "Create `services/ai.ts`. Write an `async` function that uses the `google-generativeai` package to send a prompt to the model and return the generated text."
        },
        {
          title: "Step 4: Connect the UI Button.",
          explanation: "In your Chat component, update the 'Submit' button's `onClick` handler. Instead of just adding text to the screen, make it call your new `async` API function, wait for the response, and then update the state with the AI's answer."
        }
      ],
      mistakes: [
        "Naming the environment variable `GEMINI_API_KEY` instead of `VITE_GEMINI_API_KEY`. (Vite strictly requires the VITE_ prefix to expose variables to the frontend).",
        "Uploading the .env file to GitHub. (If you do this, you must immediately delete the key in Google AI Studio and generate a new one).",
        "Not using `async/await`. The API takes a few seconds to respond. If you don't await the response, your code will try to display the text before Google has even finished generating it."
      ],
      goodToKnow: {
        topic: "Backend Proxy Servers",
        tools: ["Node.js/Express", "Next.js API Routes"],
        whyPostponed: "Right now, we are calling the Gemini API directly from the frontend React code. In a true enterprise production app, you never do this because even with environment variables, the key is eventually exposed in the browser's network tab. Instead, the frontend talks to a custom Backend Server, and the Backend Server talks to Gemini safely. We will cover Backends later."
      },
      videos: [
        {
          title: "What is an API?",
          channel: "Web Dev Simplified",
          duration: "14 min",
          url: "https://youtube.com",
          whyWatch: "If you don't understand how the 'Waiter in a restaurant' analogy works for APIs, you will struggle to debug network errors. Watch this to understand the HTTP lifecycle."
        },
        {
          title: "Async Await JavaScript Explanation",
          channel: "Fireship",
          duration: "10 min",
          url: "https://youtube.com",
          whyWatch: "APIs take time. Your code executes instantly. You MUST understand how to make JavaScript pause and wait for the API response. This video explains Async/Await perfectly."
        }
      ],
      endOfDay: {
        accomplished: "You successfully integrated a Large Language Model into your application.",
        capability: "Your app can now process dynamic user input, communicate with a server, and generate intelligent responses in real-time.",
        tomorrow: "We will implement Markdown parsing, so the AI's responses look beautiful instead of like a wall of raw text."
      }
    };
  }

  return {
    goal: `${meta.title}`,
    context: {
      buildingToday: `Today, we are focusing entirely on implementing the ${meta.title} feature.`,
      whyNeeded: `A modern application requires ${meta.title} to be functional, secure, and user-friendly. Without this, the application remains incomplete.`,
      connectionYesterday: `Yesterday, we laid the foundational groundwork that makes today's feature possible.`,
      connectionTomorrow: `Tomorrow, we will build upon this feature, extending its capability to handle more complex user workflows.`
    },
    concepts: [
      {
        name: `The Core Theory of ${meta.title}`,
        whatIsIt: `This is a fundamental software engineering concept related to ${meta.title}. It dictates how data is structured, processed, or displayed.`,
        whyToday: `We cannot build today's feature without understanding how this mechanism operates under the hood.`,
        realWorld: [
          `Used in enterprise dashboards for data management.`,
          `Essential for mobile application lifecycles.`,
          `Core component of modern SaaS platforms.`
        ],
        howItWorks: `User triggers action -> System captures event -> Logic processes data -> UI updates to reflect the new state.`,
        whatWeBuild: `We will build a custom implementation of this flow specifically tailored for our AI application.`
      }
    ],
    files: [
      {
        name: `components/${meta.title.replace(/\s+/g, '')}.tsx`,
        whyExists: `To encapsulate the logic and UI for the ${meta.title} feature in a dedicated module.`,
        proContext: `Professionals isolate features into distinct files. This prevents 'Spaghetti Code' and allows multiple developers to work on the project simultaneously without causing merge conflicts.`
      }
    ],
    steps: [
      {
        title: `Step 1: Understand the Architecture`,
        explanation: `Before writing any code, map out how the ${meta.title} feature fits into the existing layout.`
      },
      {
        title: `Step 2: Scaffold the Component`,
        explanation: `Create the necessary files and write the basic functional wrapper. Import it into the main App.`
      },
      {
        title: `Step 3: Implement Core Logic`,
        explanation: `Write the state management or API calls required to make the feature interactive.`
      },
      {
        title: `Step 4: Connect the UI`,
        explanation: `Bind your logic to buttons, forms, or display elements so the user can actually use it.`
      }
    ],
    mistakes: [
      `Writing the logic directly inside the main App.tsx file instead of creating a new component.`,
      `Forgetting to handle loading or error states (always assume the network can fail).`,
      `Not testing the edge cases (what happens if the user clicks a button twice rapidly?).`
    ],
    goodToKnow: {
      topic: `Advanced Patterns for ${meta.title}`,
      tools: [`Redux`, `GraphQL`, `Microservices`],
      whyPostponed: `These are enterprise-grade solutions. They solve problems that only occur when you have millions of users. Using them now would overcomplicate the project. Master the basics first.`
    },
    videos: [
      {
        title: `Understanding ${meta.title} in Modern Web Dev`,
        channel: `Fireship`,
        duration: `100 Seconds`,
        url: `https://youtube.com`,
        whyWatch: `A high-level architectural overview to give you mental models before you write the code.`
      }
    ],
    endOfDay: {
      accomplished: `You successfully architected and implemented the ${meta.title} feature.`,
      capability: `Your application is now more robust and closer to a production-ready state.`,
      tomorrow: `We will test this feature and integrate it with the next major module in our sprint plan.`
    }
  };
};

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

const Dashboard = ({ progress }: { progress: Record<number, boolean> }) => {
  const completedCount = Object.values(progress).filter(Boolean).length;
  const remainingCount = TOTAL_DAYS - completedCount;
  const percentComplete = Math.round((completedCount / TOTAL_DAYS) * 100) || 0;
  const completedLabs = CURRICULUM.filter(d => d.isLab && progress[d.day]).length;

  const currentDay = CURRICULUM.find(d => !progress[d.day])?.day || TOTAL_DAYS;
  const currentWeek = CURRICULUM.find(d => d.day === currentDay)?.week || 6;

  const weeklyData = [1, 2, 3, 4, 5, 6].map(weekNum => {
    const daysInWeek = CURRICULUM.filter(d => d.week === weekNum);
    const completedInWeek = daysInWeek.filter(d => progress[d.day]).length;
    return {
      name: `W${weekNum}`,
      completed: completedInWeek,
      total: daysInWeek.length,
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Overall Progress</h3>
            <TrendingUp className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{percentComplete}%</div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${percentComplete}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Current Phase</h3>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">Week {currentWeek}</div>
          <p className="text-xs text-slate-500 mt-1">Up next: Day {currentDay}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Engineering Labs</h3>
            <Terminal className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedLabs} / {TOTAL_LABS}</div>
          <p className="text-xs text-slate-500 mt-1">Core labs completed</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium text-slate-500">Days Remaining</h3>
            <Award className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{remainingCount}</div>
          <p className="text-xs text-slate-500 mt-1">{completedCount} days completed</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Weekly Velocity</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} name="Days Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const ProgressTracker = ({
  progress,
  setProgress,
  remarks,
  setRemarks
}: {
  progress: Record<number, boolean>;
  setProgress: any;
  remarks: Record<number, string>;
  setRemarks: any;
}) => {
  const handleToggle = (day: number, val: string) => {
    setProgress((prev: any) => ({ ...prev, [day]: val === 'yes' }));
  };

  const handleRemark = (day: number, val: string) => {
    setRemarks((prev: any) => ({ ...prev, [day]: val }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sprint Planner</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Day</th>
                <th className="px-6 py-4">Sprint Goal</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-center">Completed</th>
                <th className="px-6 py-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {CURRICULUM.map((item) => (
                <tr key={item.day} className={`hover:bg-slate-50/50 transition-colors ${progress[item.day] ? 'bg-blue-50/20' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                    Day {item.day}
                    <span className="ml-2 text-xs text-slate-400 font-normal border border-slate-200 rounded px-1.5 py-0.5">W{item.week}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {item.title}
                  </td>
                  <td className="px-6 py-4">
                    {item.isLab ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                        <Terminal className="w-3 h-3 mr-1" /> Lab
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500 border border-slate-200">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <select
                      value={progress[item.day] ? 'yes' : 'no'}
                      onChange={(e) => handleToggle(item.day, e.target.value)}
                      className={`block w-full rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:leading-6 cursor-pointer ${
                        progress[item.day]
                          ? 'text-blue-700 bg-blue-50 ring-blue-300 focus:ring-blue-600'
                          : 'text-slate-900 ring-slate-300 focus:ring-slate-600'
                      }`}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Add notes..."
                      value={remarks[item.day] || ''}
                      onChange={(e) => handleRemark(item.day, e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MentorHandbook = () => {
  const [selectedDay, setSelectedDay] = useState(1);
  const data = useMemo(() => getHandbookContent(selectedDay), [selectedDay]);
  const meta = CURRICULUM.find(d => d.day === selectedDay)!;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mentor Handbook</h1>
          <p className="text-slate-500 text-sm mt-1">Interactive Mentorship & Technical Guide</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDay(Math.max(1, selectedDay - 1))}
            disabled={selectedDay === 1}
            className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 bg-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            className="block rounded-md border-0 py-1.5 pl-3 pr-8 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white font-medium shadow-sm cursor-pointer"
          >
            {CURRICULUM.map(d => (
              <option key={d.day} value={d.day}>Day {d.day}: {d.title}</option>
            ))}
          </select>
          
          <button
            onClick={() => setSelectedDay(Math.min(TOTAL_DAYS, selectedDay + 1))}
            disabled={selectedDay === TOTAL_DAYS}
            className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-200 bg-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-900 px-8 py-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">Week {meta.week}</span>
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">Day {meta.day}</span>
            {meta.isLab && <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center"><Terminal className="w-3 h-3 mr-1"/> Engineering Lab</span>}
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">{data.goal}</h2>
        </div>

        <div className="p-8 space-y-12 text-slate-800 leading-relaxed">
          <section className="bg-blue-50 border border-blue-100 rounded-xl p-6 relative">
            <Compass className="absolute top-6 right-6 w-8 h-8 text-blue-200" />
            <h3 className="text-lg font-bold text-blue-900 flex items-center mb-4">
              <Target className="w-5 h-5 mr-2" />
              Why are we here today?
            </h3>
            <div className="space-y-4 text-blue-800 text-sm">
              <p><strong>What we are building:</strong> {data.context.buildingToday}</p>
              <p><strong>Why it's needed:</strong> {data.context.whyNeeded}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-blue-200/60">
                <div>
                  <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Yesterday</span>
                  <p className="mt-1 text-slate-600">{data.context.connectionYesterday}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-blue-600 tracking-wider">Tomorrow</span>
                  <p className="mt-1 text-slate-600">{data.context.connectionTomorrow}</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-6">
              <Layers className="w-5 h-5 mr-2 text-indigo-500" />
              New Concepts You Must Understand
            </h3>
            <div className="space-y-6">
              {data.concepts.map((concept, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                    <h4 className="font-bold text-slate-900">{concept.name}</h4>
                  </div>
                  <div className="p-5 space-y-4 text-sm text-slate-600">
                    <div><strong className="text-slate-900 block mb-1">What is it?</strong> {concept.whatIsIt}</div>
                    <div><strong className="text-slate-900 block mb-1">Why do we need it today?</strong> {concept.whyToday}</div>
                    <div>
                      <strong className="text-slate-900 block mb-1">Where is it used in the real world?</strong>
                      <ul className="list-disc pl-5 space-y-1">
                        {concept.realWorld.map((rw, i) => <li key={i}>{rw}</li>)}
                      </ul>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <strong className="text-slate-900 block mb-1">How it works internally:</strong>
                      <p className="font-mono text-xs text-indigo-700 bg-indigo-50 p-2 rounded mt-2">{concept.howItWorks}</p>
                    </div>
                    <div><strong className="text-slate-900">What we build with it:</strong> {concept.whatWeBuild}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-6">
              <CheckSquare className="w-5 h-5 mr-2 text-emerald-500" />
              Step-by-Step Implementation
            </h3>
            <div className="space-y-4">
              {data.steps.map((step, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mr-4 mt-1 border border-emerald-200">
                    {idx + 1}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex-1 hover:border-emerald-300 transition-colors">
                    <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{step.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-4">
              <FileCode className="w-5 h-5 mr-2 text-slate-500" />
              Files Created Today
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.files.map((file, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="font-mono text-sm font-bold text-blue-600 mb-2">{file.name}</div>
                  <p className="text-sm text-slate-700 mb-2"><strong>Purpose:</strong> {file.whyExists}</p>
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded"><strong>Pro Context:</strong> {file.proContext}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-red-50 border border-red-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-red-900 flex items-center mb-4">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Common Mistakes Today
              </h3>
              <ul className="space-y-3">
                {data.mistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start text-sm text-red-800">
                    <X className="w-4 h-4 mr-2 flex-shrink-0 text-red-500 mt-0.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </section>
            
            <section className="bg-amber-50 border border-amber-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-900 flex items-center mb-4">
                <Lightbulb className="w-5 h-5 mr-2 text-amber-500" />
                Good to Know (Postponed)
              </h3>
              <div className="text-sm text-amber-800 space-y-3">
                <p><strong>Related Topic:</strong> {data.goodToKnow.topic}</p>
                <p><strong>Professional Tools:</strong> {data.goodToKnow.tools.join(', ')}</p>
                <div className="bg-amber-100/50 p-3 rounded text-amber-900 border border-amber-200">
                  <strong>Why you don't need this today:</strong><br/>
                  {data.goodToKnow.whyPostponed}
                </div>
              </div>
            </section>
          </div>

          <section>
            <h3 className="text-xl font-bold text-slate-900 flex items-center mb-4">
              <Youtube className="w-5 h-5 mr-2 text-red-600" />
              Required Viewing Before Coding
            </h3>
            <div className="space-y-4">
              {data.videos.map((video, idx) => (
                <div key={idx} className="flex items-start bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <Youtube className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center">
                      <a href={video.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">
                        {video.title}
                      </a>
                      <span className="ml-3 text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-normal">{video.duration}</span>
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-1 mb-2">Channel: {video.channel}</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                      <strong>Why watch this?</strong> {video.whyWatch}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <h3 className="text-xl font-bold mb-6 flex items-center text-blue-400">
              <Award className="w-6 h-6 mr-2" />
              End of Day Wrap-Up
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" />
                <p><strong className="text-white block mb-1">What you accomplished:</strong> {data.endOfDay.accomplished}</p>
              </div>
              <div className="flex items-start">
                <TrendingUp className="w-5 h-5 mr-3 text-blue-400 flex-shrink-0" />
                <p><strong className="text-white block mb-1">Application new capability:</strong> {data.endOfDay.capability}</p>
              </div>
              <div className="flex items-start">
                <ArrowRight className="w-5 h-5 mr-3 text-amber-400 flex-shrink-0" />
                <p><strong className="text-white block mb-1">What happens tomorrow:</strong> {data.endOfDay.tomorrow}</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'planner' | 'handbook'>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [progress, setProgress] = useLocalStorage<Record<number, boolean>>('intern_progress', {});
  const [remarks, setRemarks] = useLocalStorage<Record<number, string>>('intern_remarks', {});

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'planner', label: 'Sprint Planner', icon: ListTodo },
    { id: 'handbook', label: 'Mentor Handbook', icon: BookOpen },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center">
              <Terminal className="w-5 h-5 mr-2 text-blue-500" />
              Intern Hub
            </h2>
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-8 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 mr-3 ${activeTab === item.id ? 'text-blue-200' : 'text-slate-400'}`} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 py-3 md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-500 hover:text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-semibold text-slate-900">AI Intern Bootcamp</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard progress={progress} />}
            {activeTab === 'planner' && (
              <ProgressTracker
                progress={progress}
                setProgress={setProgress}
                remarks={remarks}
                setRemarks={setRemarks}
              />
            )}
            {activeTab === 'handbook' && <MentorHandbook />}
          </div>
        </div>
      </main>
    </div>
  );
}
