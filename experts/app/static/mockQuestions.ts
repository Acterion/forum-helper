export type Post = {
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
};

export type ForumThreadQuestion = {
    id: string;
    mainPost: Post;
    replies: Post[];
    suggestedReplies: string[];
};

export const mockQuestions: ForumThreadQuestion[] = [
    {
      id: "1",
      mainPost: {
        author: "TechEnthusiast",
        avatar: "/placeholder.svg?height=40&width=40",
        content: "What's the best way to learn React in 2023?",
        timestamp: "2 hours ago"
      },
      replies: [
        {
          author: "CodeMaster",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "I'd recommend starting with the official React documentation and then building small projects.",
          timestamp: "1 hour ago"
        },
        {
          author: "WebDevNewbie",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "I found online courses really helpful when I was learning React.",
          timestamp: "45 minutes ago"
        }
      ],
      suggestedReplies: [
        "Focus on learning React hooks and functional components, as they're the modern way of writing React applications.",
        "Start by mastering JavaScript fundamentals before diving into React. A solid JS foundation will make learning React much easier."
      ]
    },
    {
      id: "2",
      mainPost: {
        author: "DesignEnthusiast",
        avatar: "/placeholder.svg?height=40&width=40",
        content: "What's your preferred CSS framework for React projects?",
        timestamp: "3 hours ago"
      },
      replies: [
        {
          author: "UIWizard",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "I've been using Tailwind CSS lately and it's been a game-changer for my productivity.",
          timestamp: "2 hours ago"
        },
        {
          author: "CSSNinja",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "I still prefer writing custom CSS for most projects, but I use Material-UI for rapid prototyping.",
          timestamp: "1 hour ago"
        }
      ],
      suggestedReplies: [
        "Tailwind CSS is great for rapid development and maintaining consistent designs across large projects.",
        "CSS-in-JS solutions like styled-components offer a great balance between flexibility and component-based styling."
      ]
    },
    {
      id: "3",
      mainPost: {
        author: "PerformanceGuru",
        avatar: "/placeholder.svg?height=40&width=40",
        content: "What's your go-to method for optimizing React app performance?",
        timestamp: "4 hours ago"
      },
      replies: [
        {
          author: "ReactOptimizer",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "I always start with React.memo and useMemo for expensive computations.",
          timestamp: "3 hours ago"
        },
        {
          author: "SpeedDemon",
          avatar: "/placeholder.svg?height=40&width=40",
          content: "Lazy loading components and code splitting have given me the biggest performance gains.",
          timestamp: "2 hours ago"
        }
      ],
      suggestedReplies: [
        "Implement virtualization for long lists using libraries like react-window or react-virtualized.",
        "Focus on reducing unnecessary re-renders by properly managing state and using hooks like useCallback."
      ]
    }
  ]

  export const idList = mockQuestions.map((question) => question.id)