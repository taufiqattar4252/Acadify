import { Container } from '@/components/ui/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <Container className="py-10">
      <PageHeader 
        title="Welcome to MHT-CET Platform" 
        description="Your comprehensive mock test platform is ready."
        actions={<Button>Start Test</Button>}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-2">Practice Tests</h3>
          <p className="text-muted-foreground mb-4">Access hundreds of MHT-CET practice questions across Physics, Chemistry, and Mathematics.</p>
          <Button variant="secondary" className="w-full">View Tests</Button>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
          <p className="text-muted-foreground mb-4">Track your progress and identify areas for improvement with detailed analytics.</p>
          <Button variant="secondary" className="w-full">View Analytics</Button>
        </Card>
      </div>
    </Container>
  );
}
