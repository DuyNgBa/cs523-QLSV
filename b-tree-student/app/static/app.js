function switchTab(tabName) {
    const homeTab = document.getElementById("tab-home");
    const visualizeTab = document.getElementById("tab-visualize");
    const buttons = document.querySelectorAll(".tab-btn");

    if (!homeTab || !visualizeTab || buttons.length < 2) return;

    homeTab.classList.remove("active");
    visualizeTab.classList.remove("active");
    buttons.forEach(btn => btn.classList.remove("active"));

    if (tabName === "home") {
        homeTab.classList.add("active");
        buttons[0].classList.add("active");
    } else {
        visualizeTab.classList.add("active");
        buttons[1].classList.add("active");
    }
}

function showMessage(msg, isError = false) {
    const box = document.getElementById("message");
    if (!box) return;

    box.innerText = msg || "";
    box.style.color = isError ? "#fecaca" : "#bae6fd";
    box.style.background = isError ? "rgba(127, 29, 29, 0.25)" : "rgba(14, 165, 233, 0.12)";
    box.style.border = isError
        ? "1px solid rgba(248, 113, 113, 0.28)"
        : "1px solid rgba(56, 189, 248, 0.22)";
}

function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function renderStudents(students) {
    const tbody = document.getElementById("student_table_body");
    const count = document.getElementById("student_count");

    if (!tbody || !count) return;

    const safeStudents = Array.isArray(students) ? students : [];
    tbody.innerHTML = "";
    count.innerText = `${safeStudents.length} sinh viên`;

    if (safeStudents.length === 0) {
        const row = document.createElement("tr");
        row.innerHTML = `<td colspan="6" style="text-align:center; color:#94a3b8;">Chưa có dữ liệu sinh viên</td>`;
        tbody.appendChild(row);
        return;
    }

    for (const s of safeStudents) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${escapeHtml(s.mssv)}</td>
            <td>${escapeHtml(s.ho_ten)}</td>
            <td>${escapeHtml(s.gioi_tinh)}</td>
            <td>${escapeHtml(s.ngay_sinh)}</td>
            <td>${escapeHtml(s.que_quan)}</td>
            <td>${escapeHtml(s.khoa)}</td>
        `;
        tbody.appendChild(row);
    }
}

function createKeyChip(key) {
    const chip = document.createElement("span");
    chip.className = "tree-key-chip";
    chip.textContent = key;
    return chip;
}

function createTreeElement(nodeData, depth = 0) {
    const group = document.createElement("div");
    group.className = `tree-node-group depth-${depth}`;

    const shell = document.createElement("div");
    shell.className = "tree-node-shell";

    const keys = Array.isArray(nodeData?.keys) ? nodeData.keys : [];
    shell.dataset.keys = JSON.stringify(keys);

    const keysWrap = document.createElement("div");
    keysWrap.className = "tree-node-keys";

    if (keys.length === 0) {
        const emptyChip = document.createElement("span");
        emptyChip.className = "tree-key-chip empty";
        emptyChip.textContent = "(rỗng)";
        keysWrap.appendChild(emptyChip);
    } else {
        keys.forEach((key) => keysWrap.appendChild(createKeyChip(key)));
    }

    shell.appendChild(keysWrap);
    group.appendChild(shell);

    const children = Array.isArray(nodeData?.children) ? nodeData.children : [];
    if (children.length > 0) {
        const row = document.createElement("div");
        row.className = "tree-children-row";

        const rail = document.createElement("div");
        rail.className = "tree-children-rail";
        row.appendChild(rail);

        const childrenWrap = document.createElement("div");
        childrenWrap.className = "tree-children";
        childrenWrap.style.gridTemplateColumns = `repeat(${children.length}, max-content)`;

        children.forEach((child) => {
            const slot = document.createElement("div");
            slot.className = "tree-child-slot";

            const line = document.createElement("div");
            line.className = "tree-child-line";
            slot.appendChild(line);

            slot.appendChild(createTreeElement(child, depth + 1));
            childrenWrap.appendChild(slot);
        });

        row.appendChild(childrenWrap);
        group.appendChild(row);
    }

    return group;
}

function renderTree(node, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    const isEmptyTree =
        !node ||
        ((!Array.isArray(node.keys) || node.keys.length === 0) &&
         (!Array.isArray(node.children) || node.children.length === 0));

    if (isEmptyTree) {
        container.innerHTML = `<div class="empty-note">Chưa có dữ liệu để hiển thị.</div>`;
        return;
    }

    const viewport = document.createElement("div");
    viewport.className = "tree-viewport";
    viewport.appendChild(createTreeElement(node));

    container.appendChild(viewport);
}

function renderState(state) {
    if (!state || typeof state !== "object") return;

    renderStudents(state.students || []);
    renderTree(state.mssv_index, "mssv_tree");
    renderTree(state.name_index, "name_tree");
}

function clearFormAfterAdd() {
    const ids = ["mssv", "ho_ten", "gioi_tinh", "ngay_sinh", "que_quan", "Khoa"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function isValidDateFormat(dateStr) {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

async function safeFetchJson(url, options = {}) {
    const res = await fetch(url, options);

    let data = null;
    try {
        data = await res.json();
    } catch (_) {}

    if (!res.ok) {
        const msg = data?.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }

    return data;
}

async function loadState() {
    try {
        const data = await safeFetchJson("/state");
        renderState(data);
    } catch (error) {
        console.error("Lỗi loadState:", error);
        showMessage("Không thể làm mới dữ liệu.", true);
    }
}

async function addStudent() {
    try {
        const payload = {
            mssv: document.getElementById("mssv")?.value.trim() || "",
            ho_ten: document.getElementById("ho_ten")?.value.trim() || "",
            gioi_tinh: document.getElementById("gioi_tinh")?.value.trim() || "",
            ngay_sinh: document.getElementById("ngay_sinh")?.value.trim() || "",
            que_quan: document.getElementById("que_quan")?.value.trim() || "",
            khoa: document.getElementById("Khoa")?.value.trim() || ""
        };

        if (!payload.mssv || !payload.ho_ten || !payload.gioi_tinh || !payload.ngay_sinh || !payload.que_quan || !payload.khoa) {
            showMessage("Vui lòng nhập đầy đủ thông tin.", true);
            return;
        }

        if (!isValidDateFormat(payload.ngay_sinh)) {
            showMessage("Ngày sinh phải đúng định dạng YYYY-MM-DD.", true);
            return;
        }

        const data = await safeFetchJson("/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        showMessage(data.message || "Thêm sinh viên thành công.");

        if (data.success) {
            renderState(data.state);
            clearFormAfterAdd();
            clearTrace("mssv_tree", "mssv_trace_steps", "mssv_trace_result");
            clearTrace("name_tree", "name_trace_steps", "name_trace_result");
        }
    } catch (error) {
        console.error("Lỗi addStudent:", error);
        showMessage(error.message || "Không thể thêm sinh viên.", true);
    }
}

async function deleteStudent() {
    try {
        const input = document.getElementById("delete_mssv");
        const mssv = input?.value.trim() || "";

        if (!mssv) {
            showMessage("Vui lòng nhập MSSV cần xóa.", true);
            return;
        }

        const data = await safeFetchJson(`/delete/${encodeURIComponent(mssv)}`, {
            method: "DELETE"
        });

        showMessage(data.message || "Xóa sinh viên thành công.");

        if (data.success) {
            renderState(data.state);
            if (input) input.value = "";
            clearTrace("mssv_tree", "mssv_trace_steps", "mssv_trace_result");
            clearTrace("name_tree", "name_trace_steps", "name_trace_result");
        }
    } catch (error) {
        console.error("Lỗi deleteStudent:", error);
        showMessage(error.message || "Không thể xóa sinh viên.", true);
    }
}

async function findByMssv() {
    const mssv = document.getElementById("find_mssv")?.value.trim() || "";
    const box = document.getElementById("search_result");

    if (!box) return;

    if (!mssv) {
        box.innerHTML = "Vui lòng nhập MSSV cần tìm.";
        return;
    }

    try {
        const data = await safeFetchJson(`/find/mssv/${encodeURIComponent(mssv)}`);
        showMessage(data.message || "");

        if (data.success && data.result) {
            const s = data.result;
            box.innerHTML = `
                <b>Kết quả tìm theo MSSV:</b><br>
                MSSV: ${escapeHtml(s.mssv)}<br>
                Họ tên: ${escapeHtml(s.ho_ten)}<br>
                Giới tính: ${escapeHtml(s.gioi_tinh)}<br>
                Ngày sinh: ${escapeHtml(s.ngay_sinh)}<br>
                Quê quán: ${escapeHtml(s.que_quan)}<br>
                Khoa: ${escapeHtml(s.khoa)}
            `;
        } else {
            box.innerHTML = "Không tìm thấy sinh viên.";
        }

        renderState(data.state);
    } catch (error) {
        console.error("Lỗi findByMssv:", error);
        box.innerHTML = "Lỗi khi tìm sinh viên theo MSSV.";
        showMessage(error.message || "Không thể tìm sinh viên.", true);
    }
}

async function findByName() {
    const hoTen = document.getElementById("find_name")?.value.trim() || "";
    const box = document.getElementById("search_result");

    if (!box) return;

    if (!hoTen) {
        box.innerHTML = "Vui lòng nhập họ tên cần tìm.";
        return;
    }

    try {
        const data = await safeFetchJson(`/find/name/${encodeURIComponent(hoTen)}`);
        showMessage(data.message || "");

        if (!data.success || !data.result || data.result.length === 0) {
            box.innerHTML = "Không tìm thấy sinh viên.";
            renderState(data.state);
            return;
        }

        let html = "<b>Kết quả tìm theo họ tên:</b><br><br>";
        for (const s of data.result) {
            html += `
                MSSV: ${escapeHtml(s.mssv)}<br>
                Họ tên: ${escapeHtml(s.ho_ten)}<br>
                Giới tính: ${escapeHtml(s.gioi_tinh)}<br>
                Ngày sinh: ${escapeHtml(s.ngay_sinh)}<br>
                Quê quán: ${escapeHtml(s.que_quan)}<br>
                Khoa: ${escapeHtml(s.khoa)}<br>
                <hr>
            `;
        }

        box.innerHTML = html;
        renderState(data.state);
    } catch (error) {
        console.error("Lỗi findByName:", error);
        box.innerHTML = "Lỗi khi tìm sinh viên theo họ tên.";
        showMessage(error.message || "Không thể tìm sinh viên.", true);
    }
}

function clearNodeHighlights(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.querySelectorAll(".tree-node-shell").forEach((el) => {
        el.classList.remove("trace-active", "trace-found", "trace-not-found");
    });
}

function findNodeShellByKeys(containerId, keys) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const target = JSON.stringify(keys || []);
    const nodes = container.querySelectorAll(".tree-node-shell");

    for (const node of nodes) {
        if (node.dataset.keys === target) {
            return node;
        }
    }

    return null;
}

function renderTraceSteps(stepsContainerId, path) {
    const stepsBox = document.getElementById(stepsContainerId);
    if (!stepsBox) return;

    if (!Array.isArray(path) || path.length === 0) {
        stepsBox.innerHTML = `<div class="trace-step-item">Không có bước tìm kiếm để hiển thị.</div>`;
        return;
    }

    stepsBox.innerHTML = path.map((step, index) => {
        const keys = Array.isArray(step.node_keys) ? step.node_keys.join(" | ") : "";
        const isLeafText = step.is_leaf ? "Lá" : "Nút trong";
        const foundText = step.found ? " → Tìm thấy" : "";
        return `
            <div class="trace-step-item" data-step-index="${index}">
                <span class="trace-step-badge">Bước ${index + 1}</span>
                <span class="trace-step-text">Đi qua node: [${escapeHtml(keys)}] - ${isLeafText}${foundText}</span>
            </div>
        `;
    }).join("");
}

function highlightStepCard(stepsContainerId, stepIndex) {
    const box = document.getElementById(stepsContainerId);
    if (!box) return;

    box.querySelectorAll(".trace-step-item").forEach((item) => {
        item.classList.remove("active");
    });

    const current = box.querySelector(`[data-step-index="${stepIndex}"]`);
    if (current) current.classList.add("active");
}

function setTraceResult(resultContainerId, html) {
    const box = document.getElementById(resultContainerId);
    if (!box) return;
    box.innerHTML = html;
}

async function animateTrace(path, containerId, stepsContainerId, resultContainerId, foundMessage, notFoundMessage) {
    clearNodeHighlights(containerId);
    renderTraceSteps(stepsContainerId, path);

    if (!Array.isArray(path) || path.length === 0) {
        setTraceResult(resultContainerId, notFoundMessage);
        return;
    }

    for (let i = 0; i < path.length; i++) {
        const step = path[i];
        highlightStepCard(stepsContainerId, i);

        const shell = findNodeShellByKeys(containerId, step.node_keys);
        if (shell) {
            shell.classList.remove("trace-found", "trace-not-found");
            shell.classList.add("trace-active");
            shell.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
        }

        await sleep(900);

        if (shell) {
            shell.classList.remove("trace-active");
            if (step.found) {
                shell.classList.add("trace-found");
            }
        }
    }

    const found = path.some(step => step.found);
    if (!found) {
        const lastShell = findNodeShellByKeys(containerId, path[path.length - 1].node_keys);
        if (lastShell) {
            lastShell.classList.add("trace-not-found");
        }
    }

    setTraceResult(resultContainerId, found ? foundMessage : notFoundMessage);
}

function clearTrace(treeId, stepsId, resultId) {
    clearNodeHighlights(treeId);

    const stepsBox = document.getElementById(stepsId);
    if (stepsBox) {
        stepsBox.innerHTML = "";
    }

    const resultBox = document.getElementById(resultId);
    if (resultBox) {
        resultBox.innerHTML = "Chưa thực hiện mô phỏng tìm kiếm.";
    }
}

async function traceSearchMssv() {
    const value = document.getElementById("trace_mssv_input")?.value.trim() || "";
    if (!value) {
        showMessage("Vui lòng nhập MSSV để visualize tìm kiếm.", true);
        return;
    }

    try {
        await loadState();

        const data = await safeFetchJson(`/trace/mssv/${encodeURIComponent(value)}`);
        console.log("TRACE MSSV:", data);

        if (!data.success) {
            showMessage(data.message || "Không thể mô phỏng tìm kiếm MSSV.", true);
            return;
        }

        const trace = data.trace || {};
        const foundMessage = trace.found
            ? `<b>Kết quả:</b> Tìm thấy MSSV <b>${escapeHtml(value)}</b>.`
            : `<b>Kết quả:</b> Không tìm thấy MSSV <b>${escapeHtml(value)}</b>.`;

        await animateTrace(
            trace.path || [],
            "mssv_tree",
            "mssv_trace_steps",
            "mssv_trace_result",
            foundMessage,
            foundMessage
        );

        showMessage(data.message || "Đã mô phỏng tìm kiếm MSSV.");
        switchTab("visualize");
    } catch (error) {
        console.error("Lỗi traceSearchMssv:", error);
        showMessage(error.message || "Không thể visualize tìm kiếm MSSV.", true);
    }
}

async function traceSearchName() {
    const value = document.getElementById("trace_name_input")?.value.trim() || "";
    if (!value) {
        showMessage("Vui lòng nhập họ tên để visualize tìm kiếm.", true);
        return;
    }

    try {
        await loadState();

        const data = await safeFetchJson(`/trace/name/${encodeURIComponent(value)}`);
        console.log("TRACE NAME:", data);

        if (!data.success) {
            showMessage(data.message || "Không thể mô phỏng tìm kiếm họ tên.", true);
            return;
        }

        const trace = data.trace || {};
        const found = !!trace.found;
        let foundMessage = `<b>Kết quả:</b> Không tìm thấy họ tên <b>${escapeHtml(value)}</b>.`;

        if (found) {
            const records = Array.isArray(trace.records) ? trace.records : [];
            const list = records.map(r => escapeHtml(r.mssv)).join(", ");
            foundMessage = `<b>Kết quả:</b> Tìm thấy họ tên <b>${escapeHtml(value)}</b>${list ? ` - MSSV: <b>${list}</b>` : ""}.`;
        }

        await animateTrace(
            trace.path || [],
            "name_tree",
            "name_trace_steps",
            "name_trace_result",
            foundMessage,
            foundMessage
        );

        showMessage(data.message || "Đã mô phỏng tìm kiếm họ tên.");
        switchTab("visualize");
    } catch (error) {
        console.error("Lỗi traceSearchName:", error);
        showMessage(error.message || "Không thể visualize tìm kiếm họ tên.", true);
    }
}

window.onload = () => {
    loadState();
};