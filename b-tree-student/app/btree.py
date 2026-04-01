class BTreeNode:
    def __init__(self, leaf=True):
        self.leaf = leaf
        self.keys = []      # list of tuples (key, value)
        self.children = []  # list of BTreeNode


class BTree:
    def __init__(self, t=2):
        # t=2 => max 3 keys/node
        self.root = BTreeNode()
        self.t = t

    def search(self, key, node=None):
        if node is None:
            node = self.root

        i = 0
        while i < len(node.keys) and key > node.keys[i][0]:
            i += 1

        if i < len(node.keys) and key == node.keys[i][0]:
            return node.keys[i][1]

        if node.leaf:
            return None

        return self.search(key, node.children[i])

    def search_with_trace(self, key):
        path = []
        found, value = self._search_with_trace(self.root, key, path)
        return {
            "found": found,
            "value": value,
            "path": path
        }

    def _search_with_trace(self, node, key, path):
        node_keys = [k for k, _ in node.keys]
        i = 0

        while i < len(node.keys) and key > node.keys[i][0]:
            i += 1

        step = {
            "node_keys": node_keys,
            "compare_index": i,
            "found": False,
            "is_leaf": node.leaf
        }

        if i < len(node.keys) and key == node.keys[i][0]:
            step["found"] = True
            path.append(step)
            return True, node.keys[i][1]

        path.append(step)

        if node.leaf:
            return False, None

        return self._search_with_trace(node.children[i], key, path)

    def insert(self, key, value):
        existing = self.search(key)
        if existing is not None:
            self._update(self.root, key, value)
            return

        root = self.root
        if len(root.keys) == 2 * self.t - 1:
            new_root = BTreeNode(leaf=False)
            new_root.children.append(root)
            self._split_child(new_root, 0)
            self.root = new_root

        self._insert_non_full(self.root, key, value)

    def _update(self, node, key, value):
        i = 0
        while i < len(node.keys) and key > node.keys[i][0]:
            i += 1

        if i < len(node.keys) and key == node.keys[i][0]:
            node.keys[i] = (key, value)
            return True

        if node.leaf:
            return False

        return self._update(node.children[i], key, value)

    def _insert_non_full(self, node, key, value):
        i = len(node.keys) - 1

        if node.leaf:
            node.keys.append((None, None))
            while i >= 0 and key < node.keys[i][0]:
                node.keys[i + 1] = node.keys[i]
                i -= 1
            node.keys[i + 1] = (key, value)
        else:
            while i >= 0 and key < node.keys[i][0]:
                i -= 1
            i += 1

            if len(node.children[i].keys) == 2 * self.t - 1:
                self._split_child(node, i)
                if key > node.keys[i][0]:
                    i += 1

            self._insert_non_full(node.children[i], key, value)

    def _split_child(self, parent, index):
        t = self.t
        node = parent.children[index]
        new_node = BTreeNode(leaf=node.leaf)

        middle_key = node.keys[t - 1]
        parent.keys.insert(index, middle_key)
        parent.children.insert(index + 1, new_node)

        new_node.keys = node.keys[t:]
        node.keys = node.keys[:t - 1]

        if not node.leaf:
            new_node.children = node.children[t:]
            node.children = node.children[:t]

    def to_dict(self):
        if self.root is None:
            return None
        return self._node_to_dict(self.root)

    def _node_to_dict(self, node):
        result = {
            "keys": [k for k, _ in node.keys],
            "children": []
        }

        if not node.leaf:
            for child in node.children:
                result["children"].append(self._node_to_dict(child))

        return result