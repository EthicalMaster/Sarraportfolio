import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { authConfig, createAuth, authorisedUser, sameOrigin } from './auth'
import { AdminPage } from './page'
import { LoginPage } from './login'
import { existingProjectDrafts } from './project-import'

export const studio=new Hono()
studio.use('*',async(c,next)=>{
 c.header('Cache-Control','private, no-store, max-age=0')
 c.header('Pragma','no-cache')
 c.header('X-Robots-Tag','noindex, nofollow')
 c.header('Referrer-Policy','same-origin')
 c.header('X-Frame-Options','DENY')
 c.header('X-Content-Type-Options','nosniff')
 c.header('Content-Security-Policy',"frame-ancestors 'none'; form-action 'self'; base-uri 'self'")
 if(c.req.method!=='GET'&&c.req.method!=='HEAD'&&!sameOrigin(c))return c.text('Request origin not allowed',403)
 await next()
})
studio.use('*',bodyLimit({maxSize:8192,onError:c=>c.text('Request too large',413)}))
studio.get('/login',c=>c.html(<LoginPage configured={!!authConfig(c)} error={c.req.query('error')==='1'}/>))
studio.post('/login',async c=>{
 const config=authConfig(c)
 if(!config)return c.html(<LoginPage configured={false}/>,503)
 const form=await c.req.parseBody()
 const email=typeof form.email==='string'?form.email.trim():''
 const password=typeof form.password==='string'?form.password:''
 if(!email||email.length>254||!password||password.length>1024)return c.redirect('/admin/login?error=1',303)
 try{
  const client=createAuth(c,config)
  const {error}=await client.auth.signInWithPassword({email,password})
  if(error)return c.redirect('/admin/login?error=1',303)
  if(!await authorisedUser(client,config.ids)){await client.auth.signOut({scope:'local'});return c.redirect('/admin/login?error=1',303)}
  return c.redirect('/admin',303)
 }catch{return c.redirect('/admin/login?error=1',303)}
})
studio.post('/logout',async c=>{
 const config=authConfig(c)
 if(config){try{await createAuth(c,config).auth.signOut({scope:'local'})}catch{return c.text('Sign-out could not complete. Please try again.',503)}}
 return c.redirect('/admin/login',303)
})
studio.use('*',async(c,next)=>{
 const config=authConfig(c)
 if(!config)return c.req.path.endsWith('/starter-projects')?c.json({error:'Sign-in is not configured'},503):c.redirect('/admin/login',303)
 try{if(!await authorisedUser(createAuth(c,config),config.ids))return c.req.path.endsWith('/starter-projects')?c.json({error:'Unauthorised'},401):c.redirect('/admin/login',303)}catch{return c.text('Sign-in verification is unavailable. Please try again.',503)}
 await next()
})
studio.get('/',c=>c.html(<AdminPage/>))
studio.get('/starter-projects',c=>c.json({projects:existingProjectDrafts()}))
