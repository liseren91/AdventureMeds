import ServiceCard from "../ServiceCard";

export default function ServiceCardExample() {
  return (
    <div className="w-96">
      <ServiceCard
        id="1"
        name="Jasper AI"
        subtitle="AI Copywriting"
        description="Content creation for marketing, blogs, and social media"
        price="Freemium"
        rating="4.8"
        icon="✨"
        color="#6366f1"
      />
    </div>
  );
}
