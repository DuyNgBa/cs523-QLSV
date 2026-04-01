from datetime import datetime, date

from .btree import BTree
from .repository import StudentRepository


VALID_KHOA = {
    "Khoa học máy tính",
    "Kĩ thuật máy tính",
    "Công nghệ phần mềm",
    "Mạng máy tính và truyền thông",
    "Hệ thống thông tin",
}


def normalize_text(text):
    return " ".join(str(text).lower().strip().split())


def parse_birth_date(date_str: str) -> date:
    try:
        parsed = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError("Ngày sinh phải đúng định dạng YYYY-MM-DD và là ngày hợp lệ") from exc

    today = date.today()
    if parsed > today:
        raise ValueError("Ngày sinh không được lớn hơn ngày hiện tại")

    age = today.year - parsed.year - ((today.month, today.day) < (parsed.month, parsed.day))
    if age < 15:
        raise ValueError("Ngày sinh không hợp lệ đối với sinh viên")

    return parsed


class StudentService:
    def __init__(self):
        self.repository = StudentRepository()
        self.mssv_tree = BTree(t=2)
        self.name_tree = BTree(t=2)
        self.rebuild_indexes()

    def rebuild_indexes(self):
        self.mssv_tree = BTree(t=2)
        self.name_tree = BTree(t=2)

        students = self.repository.get_all()

        for student in students:
            self.mssv_tree.insert(student["mssv"], student)

            normalized_name = normalize_text(student["ho_ten"])
            existing = self.name_tree.search(normalized_name)

            if existing is None:
                self.name_tree.insert(normalized_name, [student["mssv"]])
            else:
                if student["mssv"] not in existing:
                    existing.append(student["mssv"])
                self.name_tree.insert(normalized_name, existing)

    def get_all_students(self):
        return self.repository.get_all()

    def add_student(self, data):
        if not isinstance(data, dict):
            raise ValueError("Dữ liệu gửi lên không hợp lệ")

        mssv = str(data.get("mssv", "")).strip()
        ho_ten = str(data.get("ho_ten", "")).strip()
        gioi_tinh = str(data.get("gioi_tinh", "")).strip()
        ngay_sinh = str(data.get("ngay_sinh", "")).strip()
        que_quan = str(data.get("que_quan", "")).strip()
        khoa = str(data.get("khoa", "")).strip()

        if not mssv or not ho_ten or not gioi_tinh or not ngay_sinh or not que_quan or not khoa:
            raise ValueError("Vui lòng nhập đầy đủ thông tin")

        if len(mssv) > 8:
            raise ValueError("MSSV không được quá 8 ký tự")

        if gioi_tinh not in {"Nam", "Nữ"}:
            raise ValueError("Giới tính chỉ được là Nam hoặc Nữ")

        if khoa not in VALID_KHOA:
            raise ValueError("Khoa không hợp lệ")

        parse_birth_date(ngay_sinh)

        existing = self.repository.get_by_mssv(mssv)
        if existing is not None:
            raise ValueError("MSSV đã tồn tại")

        payload = {
            "mssv": mssv,
            "ho_ten": ho_ten,
            "gioi_tinh": gioi_tinh,
            "ngay_sinh": ngay_sinh,
            "que_quan": que_quan,
            "khoa": khoa,
        }

        self.repository.insert(payload)
        self.rebuild_indexes()

    def delete_student(self, mssv):
        mssv = str(mssv).strip()

        existing = self.repository.get_by_mssv(mssv)
        if existing is None:
            raise ValueError("Không tìm thấy sinh viên có MSSV này")

        self.repository.delete_by_mssv(mssv)
        self.rebuild_indexes()

    def find_by_mssv(self, mssv):
        self.rebuild_indexes()
        return self.mssv_tree.search(str(mssv).strip())

    def find_by_name(self, ho_ten):
        self.rebuild_indexes()

        normalized_name = normalize_text(ho_ten)
        mssv_list = self.name_tree.search(normalized_name)

        if not mssv_list:
            return []

        return self.repository.get_many_by_mssv(mssv_list)

    def trace_by_mssv(self, mssv):
        self.rebuild_indexes()
        return self.mssv_tree.search_with_trace(str(mssv).strip())

    def trace_by_name(self, ho_ten):
        self.rebuild_indexes()
        normalized_name = normalize_text(ho_ten)
        trace = self.name_tree.search_with_trace(normalized_name)

        if trace["found"]:
            mssv_list = trace["value"] or []
            trace["records"] = self.repository.get_many_by_mssv(mssv_list)
        else:
            trace["records"] = []

        return trace

    def get_state(self):
        self.rebuild_indexes()
        return {
            "students": self.get_all_students(),
            "mssv_index": self.mssv_tree.to_dict(),
            "name_index": self.name_tree.to_dict(),
        }