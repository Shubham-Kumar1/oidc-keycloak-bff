export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function AuditLogPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/api/auth/login');
  }

  const user = (session as any).user;
  
  // Mock audit log data (in production, this would come from Keycloak events API)
  const auditEvents = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      event: 'LOGIN',
      status: 'SUCCESS',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0...',
      details: 'User logged in successfully via OIDC'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      event: 'TOKEN_REFRESH',
      status: 'SUCCESS',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0...',
      details: 'Access token refreshed'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      event: 'LOGOUT',
      status: 'SUCCESS',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0...',
      details: 'User logged out'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">📋 Audit Log</h1>
          <p className="text-slate-300 mt-2">Authentication events and activity history</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">Logout</a>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Recent Events</h2>
            <span className="text-slate-400 text-sm">User: {user?.email}</span>
          </div>
          <div className="space-y-2">
            {auditEvents.map((event) => (
              <div key={event.id} className="border border-slate-700 rounded p-4 hover:bg-slate-800/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'SUCCESS' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-slate-200 font-medium">{event.event}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">{event.details}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>IP: {event.ip}</span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">Event Statistics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-800/50 rounded">
              <div className="text-2xl font-bold text-green-400">
                {auditEvents.filter(e => e.status === 'SUCCESS').length}
              </div>
              <div className="text-slate-400 text-sm mt-1">Successful Events</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded">
              <div className="text-2xl font-bold text-slate-300">
                {auditEvents.filter(e => e.event === 'LOGIN').length}
              </div>
              <div className="text-slate-400 text-sm mt-1">Login Events</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded">
              <div className="text-2xl font-bold text-slate-300">
                {auditEvents.length}
              </div>
              <div className="text-slate-400 text-sm mt-1">Total Events</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="card-body">
          <p className="text-blue-300 text-sm">
            <strong>💡 Note:</strong> In production, this would integrate with Keycloak's Event Listener API 
            to show real authentication events, failed login attempts, token refreshes, and security alerts.
            Keycloak can export events to various backends (database, Kafka, etc.).
          </p>
        </div>
      </div>
    </div>
  );
}

