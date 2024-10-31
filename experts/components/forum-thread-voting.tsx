'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { mockQuestions, type Post, ForumThreadQuestion, idList } from '@/app/static/mockQuestions'

function ForumPost({ post, isMainPost = false }: {post: Post; isMainPost?: boolean}) {
  return (
    <div className={`flex space-x-4 ${isMainPost ? 'mb-6' : 'mb-4'}`}>
      <Avatar>
        <AvatarImage src={post.avatar} alt={post.author} />
        <AvatarFallback>{post.author.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${isMainPost ? 'text-lg' : 'text-base'}`}>{post.author}</h3>
          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
        </div>
        <p className={isMainPost ? 'text-base' : 'text-sm'}>{post.content}</p>
      </div>
    </div>
  )
}

export default function ForumVotingSystem() {
  const [questionNumber, setQuestionNumber] = useState(0)
  const [currentQuestionId, setCurrentQuestionId] = useState(idList[0])
  const [selectedReplies, setSelectedReplies] = useState({} as Record<string, string>)
  const [isComplete, setIsComplete] = useState(false)
  
  const handleSubmit = () => {
    if (selectedReplies[currentQuestionId] !== undefined) {
      if (questionNumber < idList.length - 1) {
        setQuestionNumber(questionNumber + 1)
        setCurrentQuestionId(idList[questionNumber + 1])
      } else {
        setIsComplete(true)
        console.log('All responses:', selectedReplies)
      }
    } else {
      alert('Please select a reply before submitting.')
    }
  }


  if (isComplete) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold text-center mb-4">Thank you for your participation!</h2>
          <p className="text-center text-muted-foreground">Your responses have been recorded.</p>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = mockQuestions.find((question) => question.id === currentQuestionId) as ForumThreadQuestion

  const progress = ( questionNumber + 1/ idList.length) * 100
  // console.log(progress)
  // console.log(questionQueue)
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <div className="p-1 relative">
        <Progress value={progress} className="w-full h-6" />
        <div className="absolute inset-0 flex items-center justify-start pl-3">
          <span className="text-xs font-medium text-primary-foreground">
            {questionNumber + 1} / {idList.length}
          </span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-2xl font-bold mb-4">Forum Thread</CardTitle>
        <ForumPost post={currentQuestion.mainPost} isMainPost={true} />
        <Separator className="my-4" />
        {currentQuestion.replies.map((reply, index) => (
            <ForumPost key={index} post={reply} />
        ))}
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Vote for the best suggested reply:</h3>
        <RadioGroup
          value={selectedReplies[currentQuestionId]}
          onValueChange={(value) => setSelectedReplies({...selectedReplies, [currentQuestionId]: value})}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.suggestedReplies.map((reply, index) => (
              <div key={index} className="flex items-start space-x-2 p-4 border rounded-md">
                <RadioGroupItem value={reply} id={`reply-${index}`} />
                <Label htmlFor={`reply-${index}`} className="text-sm leading-snug">
                  {reply}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Submit
        </Button>
      </CardFooter>
    </Card>
  )
}