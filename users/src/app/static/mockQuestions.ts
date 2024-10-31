import { Case } from "@/types"

export const mockQuestions: Case[] = [
    {
      id: "1",
      mainPost: {
        author: "TechEnthusiast",
        avatar: "https://i.pravatar.cc/40",
        content: "What's the best way to learn React in 2023?",
        timestamp: "2 hours ago"
      },
      replies: [
        {
          author: "CodeMaster",
          avatar: "https://i.pravatar.cc/40",
          content: "I'd recommend starting with the official React documentation and then building small projects.",
          timestamp: "1 hour ago"
        },
        {
          author: "WebDevNewbie",
          avatar: "https://i.pravatar.cc/40",
          content: "I found online courses really helpful when I was learning React.",
          timestamp: "45 minutes ago"
        }
      ],
    },
    {
      id: "2",
      mainPost: {
        author: "DesignEnthusiast",
        avatar: "https://i.pravatar.cc/40",
        content: "What's your preferred CSS framework for React projects?",
        timestamp: "3 hours ago"
      },
      replies: [
        {
          author: "UIWizard",
          avatar: "https://i.pravatar.cc/40",
          content: "I've been using Tailwind CSS lately and it's been a game-changer for my productivity.",
          timestamp: "2 hours ago"
        },
        {
          author: "CSSNinja",
          avatar: "https://i.pravatar.cc/40",
          content: "I still prefer writing custom CSS for most projects, but I use Material-UI for rapid prototyping.",
          timestamp: "1 hour ago"
        }
      ]
    },
    {
      id: "3",
      mainPost: {
        author: "PerformanceGuru",
        avatar: "https://i.pravatar.cc/40",
        content: "What's your go-to method for optimizing React app performance?",
        timestamp: "4 hours ago"
      },
      replies: [
        {
          author: "ReactOptimizer",
          avatar: "https://i.pravatar.cc/40",
          content: "I always start with React.memo and useMemo for expensive computations.",
          timestamp: "3 hours ago"
        },
        {
          author: "SpeedDemon",
          avatar: "https://i.pravatar.cc/40",
          content: "Lazy loading components and code splitting have given me the biggest performance gains.",
          timestamp: "2 hours ago"
        }
      ]
    }
  ]

  export const casesList = mockQuestions.map((question) => question.id)