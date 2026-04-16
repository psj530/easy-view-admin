"use client";

import { useState, useEffect, useCallback } from "react";
import { groupsApi } from "../../lib/api";
import { showToast } from "../../components/Toast";

interface Group {
  id: number;
  name: string;
  clients: string;
  userCount: number;
  defaultRoles: string[];
  reportCount: number;
  createdAt: string;
}

const roleBadgeColor = (role: string) => {
  const map: Record<string, string> = {
    Admin: "bg-red-100 text-red-700",
    Manager: "bg-blue-100 text-blue-700",
    Editor: "bg-purple-100 text-purple-700",
    Viewer: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clients: "",
    defaultRoles: [] as string[],
  });

  const fetchGroups = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      const data = await groupsApi.list(params);
      setGroups(data.groups || []);
      setTotal(data.total ?? (data.groups?.length || 0));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "그룹 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGroups(search || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchGroups]);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({ name: "", clients: "", defaultRoles: [] });
    setShowModal(true);
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      clients: group.clients,
      defaultRoles: [...group.defaultRoles],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast("그룹명을 입력해주세요.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, formData);
        showToast("그룹이 수정되었습니다.", "success");
      } else {
        await groupsApi.create(formData);
        showToast("그룹이 생성되었습니다.", "success");
      }
      setShowModal(false);
      fetchGroups(search || undefined);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      defaultRoles: prev.defaultRoles.includes(role)
        ? prev.defaultRoles.filter((r) => r !== role)
        : [...prev.defaultRoles, role],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">그룹 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">
            고객사 그룹을 관리하고 기본 권한을 설정합니다.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          + 그룹 생성
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
            검색
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="그룹명, 고객사 검색"
            className="input-field"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            총 {total}개 그룹
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                  그룹명
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  고객사
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  사용자 수
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  기본 권한
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  리포트 수
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  생성일
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-pwc-gray-400"
                  >
                    로딩 중...
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-pwc-gray-400"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr
                    key={group.id}
                    className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <span className="font-medium text-pwc-black">
                        {group.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">
                      {group.clients}
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">
                      {group.userCount.toLocaleString()}명
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {group.defaultRoles.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">
                      {group.reportCount}개
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-500">
                      {group.createdAt}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors"
                        onClick={() => openEditModal(group)}
                      >
                        편집
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-pwc-black mb-4">
              {editingGroup ? "그룹 수정" : "그룹 생성"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
                  그룹명
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="그룹명 입력"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
                  고객사
                </label>
                <input
                  type="text"
                  value={formData.clients}
                  onChange={(e) =>
                    setFormData({ ...formData, clients: e.target.value })
                  }
                  placeholder="고객사 (쉼표로 구분)"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
                  기본 권한
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Admin", "Manager", "Editor", "Viewer"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        formData.defaultRoles.includes(role)
                          ? roleBadgeColor(role) + " border-transparent"
                          : "bg-white text-pwc-gray-500 border-pwc-gray-300"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50 transition-colors"
                onClick={() => setShowModal(false)}
                disabled={saving}
              >
                취소
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
