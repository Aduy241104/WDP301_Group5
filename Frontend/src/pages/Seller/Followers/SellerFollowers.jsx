import { useEffect, useState } from "react";
import { getShopFollowers } from "../../../services/followService"

export default function SellerFollowers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    try {
      const res = await getShopFollowers();
      setFollowers(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Shop Followers</h2>

      <div className="bg-white rounded-xl shadow">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="text-left p-3">Avatar</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Followed At</th>
            </tr>
          </thead>

          <tbody>
            {followers.map((f) => (
              <tr key={f.user._id} className="border-b">
                <td className="p-3">
                  <img
                    src={f.user.avatar || "/default-avatar.png"}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                </td>

                <td className="p-3">{f.user.fullname}</td>

                <td className="p-3">{f.user.email}</td>

                <td className="p-3">
                  {new Date(f.followedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}