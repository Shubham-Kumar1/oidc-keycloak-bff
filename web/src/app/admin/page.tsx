export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth';

export default async function AdminPage() {
  try {
    // Accept either 'admin' or 'realm-admin' role
    const session = await requireRole(['admin', 'realm-admin']);
    const user = (session as any).user;

    return (
      <div className="space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">👑 Admin Dashboard</h1>
            <p className="text-slate-300 mt-2">Role-based access control: Admin only</p>
          </div>
          <a className="btn btn-ghost" href="/api/auth/logout">Logout</a>
        </div>

        <div className="card border-purple-500/30 bg-gradient-to-br from-slate-800 to-slate-900">
          <div className="card-body space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-purple-400">Admin Access Granted</h2>
                <p className="text-slate-300 text-sm">You have an admin role (admin or realm-admin) from Keycloak</p>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-4">
              <p className="text-slate-200 font-medium mb-2">🔐 Admin Secret:</p>
              <p className="text-purple-300 text-lg italic">
                "Welcome, administrator! This area is protected by role-based access control. 
                Only users with the 'admin' role in Keycloak can access this page."
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body space-y-3">
              <h2 className="font-semibold text-slate-100">🔑 Your Roles</h2>
              <div className="space-y-2">
                {user?.roles?.map((role: string) => (
                  <div key={role} className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">{role}</span>
                  </div>
                )) || <p className="text-slate-400 text-sm">No roles assigned</p>}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body space-y-3">
              <h2 className="font-semibold text-slate-100">⚙️ Admin Actions</h2>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• Manage users and roles</p>
                <p>• View system logs</p>
                <p>• Configure realm settings</p>
                <p>• Monitor authentication events</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card border-yellow-500/30 bg-yellow-500/5">
          <div className="card-body">
            <p className="text-yellow-300 text-sm">
              <strong>💡 Note:</strong> This page accepts 'admin' or 'realm-admin' roles. 
              You currently have access via your 'realm-admin' role. To create a simple 'admin' realm role: 
              Realm Roles → Add Role → Name: 'admin' → Save, then assign it to your user.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      redirect('/api/auth/login');
    }
    return (
      <div className="card border-red-500/30">
        <div className="card-body">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Access Denied</h2>
          <p className="text-slate-300">{error.message}</p>
          <a href="/protected" className="btn btn-ghost mt-4">Go to Protected Area</a>
        </div>
      </div>
    );
  }
}

