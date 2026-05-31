"use client"

import { useEffect } from "react"
import Image from "next/image"
import confetti from "canvas-confetti"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Coin from "@/components/icons/Coin"
import Replay from "@/components/icons/Replay"
import { RewardsPanel } from "@/components/RewardsPanel"
import { useQuery } from "@tanstack/react-query"
import { checkRegistrationStatus } from "@/lib/contracts/player-registration"
import { useRef, useState } from "react"
import { AchievementCertificate } from "@/components/AchievementCertificate"
import { downloadElementAsImage, shareOnTwitter, shareOnFarcaster } from "@/lib/downloadAsImage"
import { Share2, Twitter, Download } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface GameCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  onGoHome: () => void
  onReplay: () => void
  onViewLeaderboard: () => void
  reward: number
  huntId?: number
  playerAddress?: string
}

export function GameCompleteModal({
  isOpen,
  onClose,
  onGoHome,
  onReplay,
  onViewLeaderboard,
  reward,
  huntId,
  playerAddress,
}: GameCompleteModalProps) {
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { data: registrationStatus } = useQuery({
    queryKey: ["registrationStatus", huntId, playerAddress],
    queryFn: () => (huntId && playerAddress ? checkRegistrationStatus(huntId, playerAddress) : null),
    enabled: isOpen && !!huntId && !!playerAddress,
  });

  const playerProgress = registrationStatus?.progressData ? {
    is_completed: registrationStatus.progressData.completed,
    reward_claimed: registrationStatus.progressData.reward_claimed,
    hunt_id: huntId
  } : undefined;

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  const handleShareAchievement = async (platform?: "twitter" | "farcaster") => {
    if (!certificateRef.current) return

    setIsGenerating(true)
    try {
      // First download the image
      const filename = `hunty-achievement-${huntId}.png`
      await downloadElementAsImage(certificateRef.current, { filename })
      
      const shareText = `I just completed "${registrationStatus?.progressData?.hunt_id ? `Hunt #${huntId}` : "a Scavenger Hunt"}" on @huntyapp! Check it out:`
      const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/hunt/${huntId}` : "https://hunty.app"

      if (platform === "twitter") {
        shareOnTwitter(shareText, shareUrl)
      } else if (platform === "farcaster") {
        shareOnFarcaster(shareText, shareUrl)
      } else {
        toast.success("Achievement image downloaded! You can now share it manually.")
      }
    } catch (error) {
      console.error("Failed to share achievement:", error)
      toast.error("Failed to generate achievement image.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-br from-[#2F2FFF] to-[#E87785] bg-clip-text text-transparent text-2xl font-bold mb-4 text-center">Game Complete</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="bg-gradient-to-b from-[#576065] to-[#787884] bg-clip-text text-transparent text-2xl font-normal">You successfully completed TDH&apos;s Crossword</p>
          <div className="flex items-center justify-center gap-2 text-2xl">
            <span>🥇</span>
            <span className="bg-gradient-to-b from-[#3737A4] to-[#0C0C4F] bg-clip-text text-transparent text-2xl font-bold">1st Place</span>
          </div>

          <div className="flex items-center justify-center gap-2 w-full">
            <p className="bg-gradient-to-b from-[#3737A4] to-[#0C0C4F] bg-clip-text text-transparent text-xl font-normal  mb-2">You won</p>
            <div className="flex items-center justify-center gap-2 bg-[#e5e5eb] p-2 rounded-xl w-[230px]">
              <Coin />
              <span className="font-bold text-lg">{reward}</span>
            </div>
          </div>

          {playerProgress && (
            <div className="mt-6 border-t border-slate-100 pt-6">
              <RewardsPanel
                rewards={[]}
                playerProgress={playerProgress}
              />
            </div>
          )}
         
          <div className="flex gap-4">
            <div className="flex-1 p-[2px] bg-gradient-to-br from-[#4A4AFF] to-[#0C0C4F] rounded-xl">
            <Button
              onClick={onGoHome}
              variant="outline"
              className="w-full h-full bg-white border-none shadow-none rounded-xl"
              style={{ background: 'white' }}
            >
              <span className="bg-gradient-to-br from-[#4A4AFF] to-[#0C0C4F] bg-clip-text text-transparent font-bold cursor-pointer">
                Go Home
              </span>
            </Button>
          </div>
            <Button onClick={onReplay} className="flex-1 bg-gradient-to-br from-[#E3225C] to-[#7B1C4A] hover:bg-pink-600 text-white cursor-pointer rounded-xl">
              <Replay /> Replay
            </Button>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  disabled={isGenerating}
                  className="w-full border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-2 h-11"
                >
                  {isGenerating ? "Generating..." : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share Achievement
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[200px] rounded-xl">
                <DropdownMenuItem onClick={() => handleShareAchievement("twitter")} className="flex items-center gap-2 cursor-pointer py-2.5">
                  <Twitter className="w-4 h-4 text-sky-500" />
                  Share on Twitter / X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareAchievement("farcaster")} className="flex items-center gap-2 cursor-pointer py-2.5">
                  <Image src="/icons/farcaster.png" alt="Farcaster" width={16} height={16} className="opacity-70" />
                  Share on Farcaster
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShareAchievement()} className="flex items-center gap-2 cursor-pointer py-2.5 border-t mt-1">
                  <Download className="w-4 h-4 text-slate-500" />
                  Download Image Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={onViewLeaderboard} className="w-full bg-gradient-to-b from-[#FFD43E] to-[#EC7F00] text-white text-xl font-black cursor-pointer rounded-xl h-11">
              See Leaderboard
            </Button>
          </div>
        </div>

        {/* Hidden Achievement Certificate for Capture */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <AchievementCertificate
            ref={certificateRef}
            playerName={playerAddress ? `${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)}` : "Explorer"}
            huntTitle={registrationStatus?.progressData?.hunt_id ? `Hunt #${huntId}` : "Scavenger Hunt"}
            points={reward}
            rank={1} // Defaulting to 1 for now or we can get rank from leaderboard
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
