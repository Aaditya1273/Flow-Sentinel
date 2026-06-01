import re

with open('app/globals.css', 'r') as f:
    content = f.read()

# Replace tool-card to match w-card exactly, and add the inner gradient directly since there's no inner element
tool_card_css = """
.tool-card {
  position: relative;
  border-radius: 24px;
  background: var(--w-seal);
  color: var(--w-tusk);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  transition: all 0.3s var(--ease-out-expo);
  overflow: hidden;
}
.tool-card:hover {
  border-color: rgba(0, 239, 139, 0.4);
}
.tool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 1px;
  background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
}
"""

btn_primary_css = """
.btn-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 26px;
  padding: 2px;
  overflow: hidden;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s var(--ease-out-expo);
  background: transparent;
  color: var(--w-tusk);
  border: none;
  box-shadow: none;
  font-family: inherit;
  font-weight: 500;
  text-transform: none !important;
  letter-spacing: 0.045em;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: -200%;
  background: conic-gradient(
    from 0deg,
    transparent 20%,
    var(--sen-green) 45%,
    var(--sen-cyan)  55%,
    transparent 80%
  );
  animation: w-border-spin 3s linear infinite;
  z-index: -2;
}
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: 24px;
  background: #000;
  z-index: -1;
  transition: background 0.2s;
}
.btn-primary:hover {
  transform: scale(1.02);
}
.btn-primary:hover::after {
  background: #111;
}
"""

btn_secondary_css = """
.btn-secondary {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 26px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.03);
  color: var(--w-tusk);
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: none;
  font-family: inherit;
  font-weight: 500;
  text-transform: none !important;
  letter-spacing: 0.045em;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
}
"""

glass_css = """
.glass {
  background: var(--w-seal);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  border-radius: 24px;
}
"""

# Apply the regex replacements carefully
content = re.sub(r'\.tool-card \{.*?(?=\.btn-primary)', tool_card_css, content, flags=re.DOTALL)
content = re.sub(r'\.btn-primary \{.*?(?=\.badge-success)', btn_primary_css + btn_secondary_css, content, flags=re.DOTALL)
content = re.sub(r'\.glass \{.*?(?=\.glass-dark)', glass_css, content, flags=re.DOTALL)

with open('app/globals.css', 'w') as f:
    f.write(content)
