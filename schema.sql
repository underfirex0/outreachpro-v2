-- Run this in your new Supabase SQL editor

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  site TEXT,
  "group" TEXT NOT NULL DEFAULT 'A' CHECK ("group" IN ('A', 'B')),
  status TEXT NOT NULL DEFAULT 'unsent' CHECK (status IN ('unsent','sent','replied','interested','not-interested','not-sure')),
  sent_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  msg_a TEXT DEFAULT 'Salam {name} 👋
Chouf had site li wajedna lik 👇
👉 {link}
Design pro, rapide, prêt à partager.
✔️ 100% personnalisable
✔️ Mobile + desktop
✔️ WhatsApp + formulaire contact
✔️ Domaine + hébergement offerts
⚡ 990 dh seulement
Tu en penses quoi ?',
  msg_b TEXT DEFAULT 'Salam {name} ! 👋
Shofo had le site li sawbna likoum —
👉 {link}
Design pro, mobile, prêt à partager.
✔️ Design pro sur mesure
✔️ Hébergement + domaine gratuits
✔️ 100% responsive
✔️ Bouton WhatsApp + formulaire contact
⚡ Prix unique : 990 dh
Dis-moi ce que t''en penses 🙏',
  send_delay INTEGER DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin','manager','agent_b')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table (bot memory)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (for API routes)
CREATE POLICY "Service role full access" ON leads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON settings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON user_roles FOR ALL USING (true);
CREATE POLICY "Service role full access" ON conversations FOR ALL USING (true);
