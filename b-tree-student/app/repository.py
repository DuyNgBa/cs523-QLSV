import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Thiếu SUPABASE_URL hoặc SUPABASE_KEY trong file .env")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class StudentRepository:
    TABLE_NAME = "sinh_vien"

    def get_all(self):
        res = (
            supabase
            .table(self.TABLE_NAME)
            .select("*")
            .order("mssv")
            .execute()
        )
        return res.data if res.data else []

    def get_by_mssv(self, mssv):
        res = (
            supabase
            .table(self.TABLE_NAME)
            .select("*")
            .eq("mssv", mssv)
            .execute()
        )
        return res.data[0] if res.data else None

    def insert(self, student_data):
        return supabase.table(self.TABLE_NAME).insert(student_data).execute()

    def delete_by_mssv(self, mssv):
        return (
            supabase
            .table(self.TABLE_NAME)
            .delete()
            .eq("mssv", mssv)
            .execute()
        )

    def get_many_by_mssv(self, mssv_list):
        if not mssv_list:
            return []

        res = (
            supabase
            .table(self.TABLE_NAME)
            .select("*")
            .in_("mssv", mssv_list)
            .execute()
        )

        return res.data if res.data else []