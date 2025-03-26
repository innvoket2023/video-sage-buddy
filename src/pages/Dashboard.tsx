import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Users, Clock, ArrowUpRight } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Videos",
      value: "24",
      icon: Film,
      trend: "+12% from last month",
    },
    {
      title: "Processing Time",
      value: "1.2h",
      icon: Clock,
      trend: "-8% from last month",
    },
    {
      title: "Active Users",
      value: "3",
      icon: Users,
      trend: "Same as last month",
    },
  ];

  const recentVideos = [
    { title: "Marketing Presentation", duration: "12:34", date: "2024-02-15" },
    { title: "Product Demo", duration: "08:45", date: "2024-02-14" },
    { title: "Team Meeting", duration: "45:21", date: "2024-02-13" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, User!</h1>
          <p className="text-gray-600">
            Here's what's happening with your videos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mt-4">{stat.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Videos */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVideos.map((video) => (
                <div
                  key={video.title}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Film className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{video.title}</p>
                      <p className="text-sm text-gray-600">
                        Duration: {video.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{video.date}</span>
                    <ArrowUpRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
