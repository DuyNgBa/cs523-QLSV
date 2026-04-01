class Student:
    def __init__(self, mssv, ho_ten, gioi_tinh, ngay_sinh, que_quan, khoa):
        self.mssv = mssv
        self.ho_ten = ho_ten
        self.gioi_tinh = gioi_tinh
        self.ngay_sinh = ngay_sinh
        self.que_quan = que_quan
        self.khoa = khoa

    def to_dict(self):
        return {
            "mssv": self.mssv,
            "ho_ten": self.ho_ten,
            "gioi_tinh": self.gioi_tinh,
            "ngay_sinh": self.ngay_sinh,
            "que_quan": self.que_quan,
            "khoa": self.khoa
        }