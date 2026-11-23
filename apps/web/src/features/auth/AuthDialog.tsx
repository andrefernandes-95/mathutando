import { useState, type FormEvent } from 'react';
import { X, Mail } from 'lucide-react';
import { requireClient } from '../../shared/supabase';

export function AuthDialog({onClose}:{onClose:()=>void}){
  const [email,setEmail]=useState('');const [sending,setSending]=useState(false);const [sent,setSent]=useState(false);const [error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();if(!email.trim())return;setSending(true);setError('');try{const {error}=await requireClient().auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin}});if(error)throw error;setSent(true);}catch(e){setError(e instanceof Error?e.message:'Não foi possível enviar o email.');}finally{setSending(false);}}
  return <div className="modal-backdrop" onClick={onClose} role="presentation"><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onClick={e=>e.stopPropagation()}><button className="close" type="button" onClick={onClose} aria-label="Fechar"><X size={19}/></button><div className="auth-icon"><Mail size={24}/></div><h2 id="login-title">Entra no Mathutando</h2>{sent?<p>Enviámos um link para <strong>{email}</strong>. Abre o email neste dispositivo para iniciares sessão.</p>:<><p>Um link de acesso por email, sem palavra-passe.</p><form onSubmit={e=>void submit(e)}><label htmlFor="login-email">Email</label><input id="login-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="nome@exemplo.pt"/><button className="primary" type="submit" disabled={sending}>{sending?'A enviar…':'Enviar link de acesso'}</button></form></>}{error&&<p className="inline-error" role="alert">{error}</p>}</section></div>;
}
