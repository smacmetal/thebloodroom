'use client';
import { useRef } from "react";

export default function AudioCheck() {
  const ember = useRef<HTMLAudioElement|null>(null);
  const evy = useRef<HTMLAudioElement|null>(null);
  const lyra = useRef<HTMLAudioElement|null>(null);

  function ensure(){ if(!ember.current){ ember.current=new Audio("/audio/ember.mp3"); ember.current.loop=true; ember.current.volume=.25; }
                    if(!evy.current){ evy.current=new Audio("/audio/evy_whisper.mp3"); evy.current.volume=.6; }
                    if(!lyra.current){ lyra.current=new Audio("/audio/lyra_whisper.mp3"); lyra.current.volume=.6; } }

  return (
    <div className="flex gap-2 mb-3">
      <button className="px-3 py-1.5 text-sm rounded-lg border border-rose-700/70 hover:bg-rose-700/10"
        onClick={async()=>{ ensure(); try{ await ember.current!.play(); }catch{} }}>Play Ember</button>
      <button className="px-3 py-1.5 text-sm rounded-lg border border-rose-700/70 hover:bg-rose-700/10"
        onClick={async()=>{ ensure(); try{ evy.current!.currentTime=0; await evy.current!.play(); }catch{} }}>Play Evy</button>
      <button className="px-3 py-1.5 text-sm rounded-lg border border-rose-700/70 hover:bg-rose-700/10"
        onClick={async()=>{ ensure(); try{ lyra.current!.currentTime=0; await lyra.current!.play(); }catch{} }}>Play Lyra</button>
      <button className="px-3 py-1.5 text-sm rounded-lg border border-rose-700/70 hover:bg-rose-700/10"
        onClick={()=>{ try{ ember.current?.pause(); }catch{} }}>Stop Ember</button>
    </div>
  );
}
