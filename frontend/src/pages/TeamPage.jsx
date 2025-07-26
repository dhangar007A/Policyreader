import React from 'react';
import { Mail, Linkedin, Github, Users } from 'lucide-react';

const TeamPage = () => {
  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "CEO & AI Research Lead",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
      bio: "PhD in Machine Learning from Stanford. Former AI researcher at Google with 10+ years in NLP and document processing.",
      linkedin: "#",
      github: "#",
      email: "sarah@policyassistant.ai"
    },
    {
      name: "Michael Rodriguez",
      role: "CTO & Full Stack Developer",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      bio: "Full-stack engineer with expertise in React, Node.js, and cloud architecture. Previously led engineering teams at fintech startups.",
      linkedin: "#",
      github: "#",
      email: "michael@policyassistant.ai"
    },
    {
      name: "Dr. Priya Patel",
      role: "Head of Product & Insurance Expert",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      bio: "15 years in insurance industry with deep expertise in policy analysis and regulatory compliance. MBA from Wharton.",
      linkedin: "#",
      github: "#",
      email: "priya@policyassistant.ai"
    },
    {
      name: "James Wilson",
      role: "Lead Data Scientist",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      bio: "Data scientist specializing in ML model optimization and deployment. Expert in Python, TensorFlow, and cloud ML platforms.",
      linkedin: "#",
      github: "#",
      email: "james@policyassistant.ai"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-6">
            Meet Our Team
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A diverse group of AI researchers, engineers, and insurance experts dedicated to revolutionizing policy management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 hover:border-purple-500/30 transition-all duration-500 group">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gradient-to-r from-purple-400 to-cyan-400 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 w-32 h-32 rounded-full mx-auto bg-gradient-to-r from-purple-400/20 to-cyan-400/20 group-hover:animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                <p className="text-lg text-purple-300 font-semibold mb-4">{member.role}</p>
              </div>
              
              <p className="text-slate-400 leading-relaxed mb-6 text-center">
                {member.bio}
              </p>
              
              <div className="flex justify-center gap-4">
                <a
                  href={member.linkedin}
                  className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl hover:from-blue-400/30 hover:to-blue-500/30 transition-all duration-300 group/link"
                >
                  <Linkedin className="w-5 h-5 text-blue-400 group-hover/link:scale-110 transition-transform" />
                </a>
                <a
                  href={member.github}
                  className="p-3 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-xl hover:from-gray-400/30 hover:to-gray-500/30 transition-all duration-300 group/link"
                >
                  <Github className="w-5 h-5 text-gray-400 group-hover/link:scale-110 transition-transform" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl hover:from-purple-400/30 hover:to-purple-500/30 transition-all duration-300 group/link"
                >
                  <Mail className="w-5 h-5 text-purple-400 group-hover/link:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/30 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Mission</h2>
            <p className="text-lg text-slate-400 leading-relaxed mb-8">
              We're always looking for talented individuals who share our passion for AI and innovation. 
              If you're interested in revolutionizing the insurance industry, we'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:careers@policyassistant.ai"
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center gap-3 justify-center shadow-lg hover:shadow-purple-500/30 hover:shadow-2xl transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                View Open Positions
              </a>
              <a
                href="mailto:hello@policyassistant.ai"
                className="px-8 py-4 rounded-2xl font-semibold text-lg border border-slate-600 text-slate-300 hover:border-purple-500/50 hover:text-white transition-all duration-300 flex items-center gap-3 justify-center"
              >
                <Users className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;