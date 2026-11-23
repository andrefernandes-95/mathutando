import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../shared/supabase';

export function useAuth(){
  const [user,setUser]=useState<User|null>(null);
  const [ready,setReady]=useState(!supabase);
  useEffect(()=>{
    if(!supabase)return;
    let mounted=true;
    supabase.auth.getUser().then(({data})=>{if(mounted){setUser(data.user);setReady(true);}}).catch(()=>{if(mounted)setReady(true);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(mounted){setUser(session?.user??null);setReady(true);}});
    return ()=>{mounted=false;subscription.unsubscribe();};
  },[]);
  return {user,ready};
}
