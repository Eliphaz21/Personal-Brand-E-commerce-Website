import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ShoppingBag,
  Heart,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const AboutCompany: React.FC = () => {
  const socialLinks = [
    { name: 'Instagram', url: 'https://www.instagram.com/kidumoges/', icon: ExternalLink, color: '#E4405F' },
    { name: 'Facebook', url: 'https://www.facebook.com/kidist.moges.9/', icon: ExternalLink, color: '#1877F2' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCHlZD122AwI1Gmc-sFWEY8A', icon: ExternalLink, color: '#FF0000' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@kiduen?is_from_webapp=1&sender_device=pc', icon: Sparkles, color: '#000000' },
    { name: 'Telegram', url: 'https://t.me/faithtoconveive', icon: MessageCircle, color: '#0088cc' },
  ];

  const expertiseAreas = [
    {
      title: 'Fertility Coaching',
      description: 'Personalized guidance for TTC (Trying To Conceive) and hormone balance with evidence-based strategies.',
      icon: Heart,
      color: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)'
    },
    {
      title: 'Medical Technology',
      description: 'Professional background in medical technology with scientific understanding of reproductive health.',
      icon: Award,
      color: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
    },
    {
      title: 'Holistic Lifestyle',
      description: 'Comprehensive approach combining nutrition, supplements, stress management, and natural wellness.',
      icon: Sparkles,
      color: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
    }
  ];

  const stats = [
    { value: '61.5K', label: 'TikTok Followers' },
    { value: '3.82K', label: 'YouTube Subscribers' },
    { value: '41', label: 'YouTube Videos' },
    { value: '17K+', label: 'Total Views' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div className="container grid-2" style={{ alignItems: 'center', gap: '4rem' }}>
          <div className="animate-fade-in-left">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--color-primary-light)',
              padding: '0.5rem 1rem',
              borderRadius: '999px',
              marginBottom: '1.5rem',
              border: '1px solid var(--color-border)'
            }}>
              <Sparkles size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Meet the Founder
              </span>
            </div>
            <h1 style={{ fontSize: '3.5rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem', lineHeight: '1.15' }}>
              Kidist <span style={{ color: 'var(--color-secondary)' }}>Habtemikael</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
              Fertility Coach • Medical Technologist • Holistic Lifestyle Vlogger
            </p>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '500px', lineHeight: '1.6' }}>
              Empowering women on their fertility journey through science-backed coaching, premium supplements, and holistic wellness guidance. Your path to conception starts here.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/shop?category=Coaching Services"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Book Coaching <ArrowRight size={16} />
              </Link>
            </div>

            {/* Affiliate Links */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href="https://www.amazon.com/gp/yourstore/home?&linkCode=sl2&tag=kidist0d-20&linkId=641447d9eee63ca4a09cf174713fdebe&language=en_US&ref_=as_li_ss_tl"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--color-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                }}
              >
                <ShoppingBag size={16} />
                Amazon Store
              </a>
              <a
                href="https://temu.to/k/upfbebbg6h0"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-secondary)',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: '1px solid var(--color-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#c9a227';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'var(--color-secondary)';
                }}
              >
                <ShoppingBag size={16} />
                Temu Affiliate
              </a>
              <a
                href="https://www.tiktok.com/@kiduen?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#000000',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  border: '1px solid #000000'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.backgroundColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = '#000000';
                }}
              >
                <Sparkles size={16} />
                TikTok
              </a>
            </div>
          </div>

          <div className="animate-fade-in-right" style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={profileCardStyle}>
              <div className="shine-line" style={shineLineStyle} />
              <img
                src="https://p16-common-sign.tiktokcdn.com/tos-maliva-avt-0068/f4e9cd42f22ac626004332a37464cd61~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=f9732c81&x-expires=1781877600&x-signature=xJaVAb3gcwuah5wMcK7vRZ%2F9%2BO4%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my"
                alt="Kidist Habtemikael"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
              />
              <div style={overlayStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <CheckCircle size={20} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>Verified Expert</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                  Certified Fertility Coach & Medical Technologist
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div className="grid-4" style={{ gap: '2rem' }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '2.5rem', color: 'var(--color-secondary)', margin: '0 0 0.5rem 0', fontWeight: 700 }}>
                  {stat.value}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', margin: 0, fontWeight: 500 }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Story Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div className="grid-2" style={{ gap: '4rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                My Story
              </span>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                From Medical Tech to Fertility Advocate
              </h2>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
                As a Medical Technologist with deep understanding of reproductive health, I witnessed countless women struggling with fertility challenges, hormone imbalances, and the emotional toll of trying to conceive.
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
                This inspired me to bridge the gap between medical science and holistic wellness. I created KidEnDu to provide comprehensive fertility support that addresses the root causes of reproductive challenges.
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.7' }}>
                Through evidence-based coaching, premium supplements, and lifestyle guidance, I help women take control of their fertility journey with confidence and hope.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                  <CheckCircle size={18} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Science-Backed Approach</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                  <CheckCircle size={18} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Holistic Wellness</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)' }}>
                  <CheckCircle size={18} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Personalized Care</span>
                </div>
              </div>
            </div>
            <div style={storyCardStyle}>
              <div style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
                  "Faith to Conceive"
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  My comprehensive guide combining medical expertise with spiritual encouragement for your fertility journey.
                </p>
                <a
                  href="https://www.amazon.ca/dp/B0G11HVF45/ref=cm_sw_r_as_gl_api_gl_i_YC640XMSJSK71D1D70GJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-secondary)',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  Get the Book <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      <section style={{ padding: '6rem 0', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Expertise
            </span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
              Three Pillars of Fertility Support
            </h2>
          </div>

          <div className="grid-3" style={{ gap: '2rem' }}>
            {expertiseAreas.map((area, index) => (
              <div key={index} className="glass-panel" style={expertiseCardStyle}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: area.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <area.icon size={28} color="var(--color-primary-dark)" />
                </div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
                  {area.title}
                </h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Connect With Me
            </span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem' }}>
              Follow My Journey
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 0' }}>
              Join thousands of women following my fertility tips, wellness advice, and daily inspiration across all platforms.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel"
                style={{
                  ...socialCardStyle,
                  borderColor: social.color,
                  background: `linear-gradient(135deg, ${social.color}15 0%, ${social.color}05 100%)`
                }}
              >
                <social.icon size={32} color={social.color} />
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                  {social.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 0', background: '#fff' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem' }}>
            Ready to Start Your Fertility Journey?
          </h2>
          <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Book a personalized coaching session or explore our premium supplements designed to support your reproductive health.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/shop?category=Coaching Services"
              className="btn"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
                padding: '0.75rem 2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Book Coaching <ArrowRight size={16} />
            </Link>
            <Link
              to="/shop"
              className="btn btn-glass"
              style={{
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)',
                padding: '0.75rem 2rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Shop Supplements <ShoppingBag size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CSS Styles */}
      <style>{`
        .about-page {
          min-height: 100vh;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.8s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.8s ease-out;
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        
        .glass-panel:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
};

// Style definitions
const heroSectionStyle: React.CSSProperties = {
  position: 'relative',
  padding: '7rem 0 5rem 0',
  background: 'linear-gradient(180deg, rgba(227, 236, 227, 0.6) 0%, rgba(247, 246, 242, 0.2) 100%)',
  overflow: 'hidden',
  borderBottom: '1px solid var(--color-border)'
};

const profileCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '400px',
  aspectRatio: '1',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: 'var(--shadow-lg)',
  position: 'relative',
  border: '2px solid rgba(255,255,255,0.3)'
};

const shineLineStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  width: '50px',
  height: '100%',
  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
  transform: 'skewX(-25deg)',
  animation: 'shine 4s ease-in-out infinite',
  pointerEvents: 'none',
  opacity: 0.5
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  padding: '1.5rem',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
  borderRadius: '0 0 20px 20px'
};

const storyCardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(227, 236, 227, 0.5) 0%, rgba(247, 246, 242, 0.3) 100%)',
  borderRadius: '20px',
  border: '1px solid rgba(255,255,255,0.5)',
  padding: '2rem',
  boxShadow: 'var(--shadow-md)'
};

const expertiseCardStyle: React.CSSProperties = {
  padding: '2.5rem 2rem',
  borderRadius: '20px',
  minHeight: '280px',
  display: 'flex',
  flexDirection: 'column'
};

const socialCardStyle: React.CSSProperties = {
  padding: '2rem 1.5rem',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  borderWidth: '2px'
};

export default AboutCompany;
