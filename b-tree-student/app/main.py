from flask import Blueprint, jsonify, render_template, request
from .service import StudentService

main_bp = Blueprint("main", __name__)
service = StudentService()


@main_bp.route("/")
def index():
    return render_template("index.html")


@main_bp.route("/state", methods=["GET"])
def get_state():
    return jsonify(service.get_state())


@main_bp.route("/add", methods=["POST"])
def add_student():
    try:
        data = request.get_json(silent=True) or {}
        service.add_student(data)
        return jsonify({
            "success": True,
            "message": "Thêm sinh viên thành công",
            "state": service.get_state()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@main_bp.route("/delete/<mssv>", methods=["DELETE"])
def delete_student(mssv):
    try:
        service.delete_student(mssv)
        return jsonify({
            "success": True,
            "message": "Xóa sinh viên thành công",
            "state": service.get_state()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@main_bp.route("/find/mssv/<mssv>", methods=["GET"])
def find_mssv(mssv):
    try:
        result = service.find_by_mssv(mssv)
        return jsonify({
            "success": True,
            "message": "Tìm theo MSSV",
            "result": result,
            "state": service.get_state()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@main_bp.route("/find/name/<ho_ten>", methods=["GET"])
def find_name(ho_ten):
    try:
        result = service.find_by_name(ho_ten)
        return jsonify({
            "success": True,
            "message": "Tìm theo họ tên",
            "result": result,
            "state": service.get_state()
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@main_bp.route("/trace/mssv/<mssv>", methods=["GET"])
def trace_mssv(mssv):
    try:
        result = service.trace_by_mssv(mssv)
        return jsonify({
            "success": True,
            "message": "Visualize tìm kiếm theo MSSV",
            "trace": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@main_bp.route("/trace/name/<ho_ten>", methods=["GET"])
def trace_name(ho_ten):
    try:
        result = service.trace_by_name(ho_ten)
        return jsonify({
            "success": True,
            "message": "Visualize tìm kiếm theo họ tên",
            "trace": result
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400