import React from 'react';
import Card from './ui/Card';

interface TeamMember {
    name: string;
    role: string;
    imageUrl: string;
}

const team: TeamMember[] = [
    { name: 'Nikhil', role: 'Lead Developer', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=400&auto=format&fit=crop' },
    { name: 'Devnand', role: 'Developer', imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop' },
    { name: 'Sajan', role: 'Developer', imageUrl: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?q=80&w=400&auto=format&fit=crop' },
    { name: 'Rayan', role: 'Developer', imageUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=400&auto=format&fit=crop' },
    { name: 'Hema DG', role: 'Developer', imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=400&auto=format&fit=crop' },
    { name: 'Saniya', role: 'Developer', imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop' },
];

const TeamMemberCard: React.FC<{ member: TeamMember }> = ({ member }) => (
    <Card className="text-center transition-transform transform hover:scale-105 hover:shadow-xl">
        <img
            src={member.imageUrl}
            alt={`Nature portrait for ${member.name}`}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-lime-green/50 object-cover"
        />
        <h3 className="text-xl font-bold text-forest-green dark:text-dark-text">{member.name}</h3>
        <p className="text-lime-green dark:text-light-green">{member.role}</p>
    </Card>
);

const AboutUsView: React.FC = () => {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12 animate-fade-in-up">
            <header className="text-center">
                <h1 className="text-5xl font-bold text-forest-green dark:text-dark-text">About GreenMap</h1>
                <p className="text-xl text-lime-green dark:text-light-green mt-2 max-w-3xl mx-auto">
                    We are a passionate team dedicated to leveraging technology for environmental good. Our mission is to empower communities to take an active role in creating a sustainable future.
                </p>
            </header>

            <section className="max-w-4xl mx-auto">
                 <Card>
                    <h2 className="text-3xl font-bold text-forest-green dark:text-dark-text mb-4">Our Mission</h2>
                    <p className="text-gray-700 dark:text-dark-text-secondary leading-relaxed">
                        GreenMap was born from a shared belief that technology can be a powerful force for positive environmental change. We are a collective of developers, designers, and environmental enthusiasts united by a single mission: to build intuitive tools that empower individuals and communities to take an active role in protecting and restoring our planet. We believe that small, collective actions can lead to significant, lasting impact. Our platform is more than just a map; it's a collaborative space for tracking progress, raising awareness, and fostering a global community dedicated to creating a greener, more sustainable future for generations to come.
                    </p>
                    <h3 className="text-2xl font-bold text-forest-green dark:text-dark-text mt-6 mb-4">Our Vision</h3>
                    <ul className="list-disc list-inside space-y-3 text-gray-700 dark:text-dark-text-secondary">
                        <li>
                            <span className="font-semibold text-lime-green">Empowerment:</span> To provide accessible tools that enable anyone, anywhere to contribute to environmental monitoring and action.
                        </li>
                        <li>
                            <span className="font-semibold text-lime-green">Awareness:</span> To visualize environmental data in a clear and compelling way, highlighting areas of concern and celebrating conservation successes.
                        </li>
                        <li>
                            <span className="font-semibold text-lime-green">Community:</span> To build a global network of engaged citizens, connecting local efforts to a worldwide movement for environmental stewardship.
                        </li>
                        <li>
                            <span className="font-semibold text-lime-green">Innovation:</span> To continuously leverage cutting-edge technology, like AI analysis, to derive meaningful insights from community-sourced data and guide effective action.
                        </li>
                        <li>
                            <span className="font-semibold text-lime-green">Impact:</span> To create a tangible, positive impact on the environment by facilitating reforestation, identifying pollution hotspots, and inspiring a culture of sustainability.
                        </li>
                    </ul>
                </Card>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-forest-green dark:text-dark-text text-center mb-8">Meet the Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {team.map(member => (
                        <TeamMemberCard key={member.name} member={member} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AboutUsView;