import { DSAProblem } from '../models/dsaTypes';
import { createProblem } from './seedDsaTop150Helper';

export const topInterview150Part2: DSAProblem[] = [
  // ================= LINKED LIST (11 Problems) =================
  createProblem({
    id: 'dsa_top150_linked_list_cycle',
    title: 'Linked List Cycle',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/linked-list-cycle/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
    examples: [{ input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).' }],
    hints: ['Floyd’s Cycle-Finding Algorithm (slow and fast pointers).', 'If fast pointer reaches null, no cycle exists.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_add_two_numbers',
    title: 'Add Two Numbers',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/add-two-numbers/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given two non-empty linked lists representing two non-negative integers in reverse order. Add the two numbers and return the sum as a linked list.',
    examples: [{ input: 'l1 = [2,4,3], l2 = [5,6,4]', output: '[7,0,8]', explanation: '342 + 465 = 807.' }],
    hints: ['Simulate column-by-column addition with a carry variable.', 'Continue as long as l1 or l2 has nodes or carry > 0.'],
    optimal_complexity: { time: 'O(max(N, M))', space: 'O(1) aux' }
  }),

  createProblem({
    id: 'dsa_top150_merge_two_sorted_lists',
    title: 'Merge Two Sorted Lists',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/merge-two-sorted-lists/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.',
    examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }],
    hints: ['Use a dummy head node and a current pointer to stitch nodes in increasing order.'],
    optimal_complexity: { time: 'O(N + M)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_copy_list_with_random_pointer',
    title: 'Copy List with Random Pointer',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/copy-list-with-random-pointer/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Construct a deep copy of a linked list where each node contains an additional random pointer pointing to any node in the list or null.',
    examples: [{ input: 'head = [[7,null],[13,0],[11,4],[10,2],[1,0]]', output: '[[7,null],[13,0],[11,4],[10,2],[1,0]]' }],
    hints: ['Interweave cloned nodes next to original nodes (A -> A\' -> B -> B\').', 'Assign random pointers: curr.next.random = curr.random.next, then unweave.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1) aux' }
  }),

  createProblem({
    id: 'dsa_top150_reverse_linked_list_ii',
    title: 'Reverse Linked List II',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/reverse-linked-list-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a singly linked list and two integers left and right where left <= right, reverse the nodes of the list from position left to position right.',
    examples: [{ input: 'head = [1,2,3,4,5], left = 2, right = 4', output: '[1,4,3,2,5]' }],
    hints: ['Reach node before left using dummy node.', 'Repeatedly move the next node to the front of sublist.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_reverse_nodes_in_k_group',
    title: 'Reverse Nodes in k-Group',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.',
    examples: [{ input: 'head = [1,2,3,4,5], k = 2', output: '[2,1,4,3,5]' }, { input: 'head = [1,2,3,4,5], k = 3', output: '[3,2,1,4,5]' }],
    hints: ['Count k nodes ahead. If fewer than k nodes remain, leave untouched.', 'Reverse k nodes and recursively or iteratively connect.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_remove_nth_node_from_end_of_list',
    title: 'Remove Nth Node From End of List',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a linked list, remove the nth node from the end of the list and return its head.',
    examples: [{ input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' }],
    hints: ['Fast and slow pointer with gap of n.', 'When fast hits null, slow is right before the target node.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_remove_duplicates_from_sorted_list_ii',
    title: 'Remove Duplicates from Sorted List II',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a sorted linked list, delete all nodes that have duplicate numbers, leaving only distinct numbers from the original list.',
    examples: [{ input: 'head = [1,2,3,3,4,4,5]', output: '[1,2,5]' }],
    hints: ['Use dummy node.', 'While head.next and head.val == head.next.val, skip all duplicate nodes.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_rotate_list',
    title: 'Rotate List',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/rotate-list/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a linked list, rotate the list to the right by k places.',
    examples: [{ input: 'head = [1,2,3,4,5], k = 2', output: '[4,5,1,2,3]' }],
    hints: ['Find length L and connect tail to head making circular ring.', 'Break the ring at position L - (k % L).'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_partition_list',
    title: 'Partition List',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/partition-list/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a linked list and a value x, partition it such that all nodes less than x come before nodes greater than or equal to x while preserving order.',
    examples: [{ input: 'head = [1,4,3,2,5,2], x = 3', output: '[1,2,2,4,3,5]' }],
    hints: ['Create two dummy lists: one for nodes < x, one for nodes >= x.', 'Join the end of first list to start of second.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_lru_cache',
    title: 'LRU Cache',
    topic_id: 'dsa_topic_linked_lists',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/lru-cache/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with get(key) and put(key, value) in O(1) average time complexity.',
    examples: [{ input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]', output: '[null, null, null, 1, null, -1, null, -1, 3, 4]' }],
    hints: ['Doubly Linked List + Hash Map.', 'Head contains most recently used, tail contains least recently used.'],
    optimal_complexity: { time: 'O(1) all ops', space: 'O(capacity)' }
  }),

  // ================= BINARY TREE GENERAL (14 Problems) =================
  createProblem({
    id: 'dsa_top150_maximum_depth_of_binary_tree',
    title: 'Maximum Depth of Binary Tree',
    topic_id: 'dsa_topic_trees',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, return its maximum depth (number of nodes along longest path from root to furthest leaf).',
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3' }],
    hints: ['DFS: 1 + max(maxDepth(root.left), maxDepth(root.right)).'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_same_tree',
    title: 'Same Tree',
    topic_id: 'dsa_topic_trees',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/same-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the roots of two binary trees p and q, write a function to check if they are the same or not.',
    examples: [{ input: 'p = [1,2,3], q = [1,2,3]', output: 'true' }],
    hints: ['Recursive comparison of values and subtrees.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_invert_binary_tree',
    title: 'Invert Binary Tree',
    topic_id: 'dsa_topic_trees',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/invert-binary-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, invert the tree, and return its root.',
    examples: [{ input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]' }],
    hints: ['Swap left and right children recursively.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_symmetric_tree',
    title: 'Symmetric Tree',
    topic_id: 'dsa_topic_trees',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/symmetric-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, check whether it is a mirror of itself (i.e., symmetric around its center).',
    examples: [{ input: 'root = [1,2,2,3,4,4,3]', output: 'true' }],
    hints: ['Compare t1.left with t2.right and t1.right with t2.left.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_construct_binary_tree_from_preorder_and_inorder_traversal',
    title: 'Construct Binary Tree from Preorder and Inorder Traversal',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two integer arrays preorder and inorder, construct and return the binary tree.',
    examples: [{ input: 'preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]', output: '[3,9,20,null,null,15,7]' }],
    hints: ['First element in preorder is root.', 'Hash map stores indices in inorder to split into left and right subtrees.'],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_construct_binary_tree_from_inorder_and_postorder_traversal',
    title: 'Construct Binary Tree from Inorder and Postorder Traversal',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two integer arrays inorder and postorder, construct and return the binary tree.',
    examples: [{ input: 'inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]', output: '[3,9,20,null,null,15,7]' }],
    hints: ['Last element in postorder is root.', 'Build right subtree before left subtree when popping from postorder.'],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_populating_next_right_pointers_in_each_node_ii',
    title: 'Populating Next Right Pointers in Each Node II',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Populate each next pointer to point to its next right node. If there is no next right node, the next pointer should be set to NULL.',
    examples: [{ input: 'root = [1,2,3,4,5,null,7]', output: '[1,#,2,3,#,4,5,7,#]' }],
    hints: ['Level order traversal or maintain dummy head for next level.'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_flatten_binary_tree_to_linked_list',
    title: 'Flatten Binary Tree to Linked List',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Flatten the tree into a "linked list" in-place following pre-order traversal sequence.',
    examples: [{ input: 'root = [1,2,5,3,4,null,6]', output: '[1,null,2,null,3,null,4,null,5,null,6]' }],
    hints: ['Morris traversal or reverse pre-order (right, left, root).'],
    optimal_complexity: { time: 'O(N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_path_sum',
    title: 'Path Sum',
    topic_id: 'dsa_topic_trees',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/path-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.',
    examples: [{ input: 'root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22', output: 'true' }],
    hints: ['Subtract node value from targetSum and recurse down to leaves.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_sum_root_to_leaf_numbers',
    title: 'Sum Root to Leaf Numbers',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/sum-root-to-leaf-numbers/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Each root-to-leaf path represents a number. Return the total sum of all root-to-leaf numbers.',
    examples: [{ input: 'root = [1,2,3]', output: '25', explanation: 'Path 1->2 represents 12, path 1->3 represents 13. Sum = 12 + 13 = 25.' }],
    hints: ['Pass current_val * 10 + node.val to children.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_binary_tree_maximum_path_sum',
    title: 'Binary Tree Maximum Path Sum',
    topic_id: 'dsa_topic_trees',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'A path in a binary tree is a sequence of nodes where each pair has an edge connecting them. Return the maximum path sum of any non-empty path.',
    examples: [{ input: 'root = [-10,9,20,null,null,15,7]', output: '42', explanation: 'Optimal path is 15 -> 20 -> 7.' }],
    hints: ['Compute max single branch contribution: max(0, maxGain(child)).', 'Global max is updated with node.val + leftGain + rightGain.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_binary_search_tree_iterator',
    title: 'Binary Search Tree Iterator',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/binary-search-tree-iterator/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Implement the BSTIterator class that represents an in-order iterator over the binary search tree (BST).',
    examples: [{ input: '["BSTIterator", "next", "next", "hasNext", "next", "hasNext"]\n[[[7, 3, 15, null, null, 9, 20]], [], [], [], [], []]', output: '[null, 3, 7, true, 9, true]' }],
    hints: ['Stack storing left spine of BST.', 'Average O(1) time and O(H) space.'],
    optimal_complexity: { time: 'O(1) avg', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_count_complete_tree_nodes',
    title: 'Count Complete Tree Nodes',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/count-complete-tree-nodes/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a complete binary tree, return the number of the nodes in the tree in less than O(n) time complexity.',
    examples: [{ input: 'root = [1,2,3,4,5,6]', output: '6' }],
    hints: ['Compare left height and right height.', 'If equal, left subtree is full: 2^h - 1 nodes. Can run in O(log^2 N).'],
    optimal_complexity: { time: 'O(log^2 N)', space: 'O(log N)' }
  }),

  createProblem({
    id: 'dsa_top150_lowest_common_ancestor_of_a_binary_tree',
    title: 'Lowest Common Ancestor of a Binary Tree',
    topic_id: 'dsa_topic_trees',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Find the lowest common ancestor (LCA) of two given nodes in the binary tree.',
    examples: [{ input: 'root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1', output: '3' }],
    hints: ['If root matches p or q, return root.', 'If both left and right return non-null, root is the LCA.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  // ================= BINARY TREE BFS (4 Problems) =================
  createProblem({
    id: 'dsa_top150_binary_tree_right_side_view',
    title: 'Binary Tree Right Side View',
    topic_id: 'dsa_topic_tree_bfs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/binary-tree-right-side-view/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, return the values of the nodes you can see ordered from top to bottom when looking from the right side.',
    examples: [{ input: 'root = [1,2,3,null,5,null,4]', output: '[1,3,4]' }],
    hints: ['BFS level-order: take the last element of each queue level.'],
    optimal_complexity: { time: 'O(N)', space: 'O(D)' }
  }),

  createProblem({
    id: 'dsa_top150_average_of_levels_in_binary_tree',
    title: 'Average of Levels in Binary Tree',
    topic_id: 'dsa_topic_tree_bfs',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, return the average value of the nodes on each level in the form of an array.',
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[3.00000,14.50000,11.00000]' }],
    hints: ['BFS: sum level nodes and divide by level size.'],
    optimal_complexity: { time: 'O(N)', space: 'O(M)' }
  }),

  createProblem({
    id: 'dsa_top150_binary_tree_level_order_traversal',
    title: 'Binary Tree Level Order Traversal',
    topic_id: 'dsa_topic_tree_bfs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }],
    hints: ['FIFO queue with size loop for each level.'],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_binary_tree_zigzag_level_order_traversal',
    title: 'Binary Tree Zigzag Level Order Traversal',
    topic_id: 'dsa_topic_tree_bfs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given root of binary tree, return zigzag level order traversal (alternating left-to-right and right-to-left).',
    examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[20,9],[15,7]]' }],
    hints: ['Maintain boolean flag for direction and prepend/append accordingly.'],
    optimal_complexity: { time: 'O(N)', space: 'O(N)' }
  }),

  // ================= BINARY SEARCH TREE (3 Problems) =================
  createProblem({
    id: 'dsa_top150_minimum_absolute_difference_in_bst',
    title: 'Minimum Absolute Difference in BST',
    topic_id: 'dsa_topic_bst',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/minimum-absolute-difference-in-bst/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a Binary Search Tree (BST), return the minimum absolute difference between the values of any two different nodes in the tree.',
    examples: [{ input: 'root = [4,2,6,1,3]', output: '1' }],
    hints: ['In-order traversal of BST yields sorted values.', 'Compare adjacent elements in in-order sequence.'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_kth_smallest_element_in_a_bst',
    title: 'Kth Smallest Element in a BST',
    topic_id: 'dsa_topic_bst',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.',
    examples: [{ input: 'root = [3,1,4,null,2], k = 1', output: '1' }],
    hints: ['In-order traversal stops when count equals k.'],
    optimal_complexity: { time: 'O(H + k)', space: 'O(H)' }
  }),

  createProblem({
    id: 'dsa_top150_validate_binary_search_tree',
    title: 'Validate Binary Search Tree',
    topic_id: 'dsa_topic_bst',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/validate-binary-search-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).',
    examples: [{ input: 'root = [2,1,3]', output: 'true' }, { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }],
    hints: ['Pass valid min and max range down to subtrees: (low, high).'],
    optimal_complexity: { time: 'O(N)', space: 'O(H)' }
  }),

  // ================= GRAPH GENERAL (6 Problems) =================
  createProblem({
    id: 'dsa_top150_number_of_islands',
    title: 'Number of Islands',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/number-of-islands/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an m x n 2D binary grid grid which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
    examples: [{ input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }],
    hints: ['Flood fill using DFS or BFS.', 'Sink visited land cells by marking as \'0\'.'],
    optimal_complexity: { time: 'O(M * N)', space: 'O(M * N)' }
  }),

  createProblem({
    id: 'dsa_top150_surrounded_regions',
    title: 'Surrounded Regions',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/surrounded-regions/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Capture all regions of \'O\' that are surrounded by \'X\' by flipping all \'O\'s into \'X\'s in that surrounded region.',
    examples: [{ input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]' }],
    hints: ['Any \'O\' connected to boundary cannot be flipped.', 'Start DFS from border \'O\' cells marking them as safe.'],
    optimal_complexity: { time: 'O(M * N)', space: 'O(M * N)' }
  }),

  createProblem({
    id: 'dsa_top150_clone_graph',
    title: 'Clone Graph',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/clone-graph/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.',
    examples: [{ input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' }],
    hints: ['Hash map mapping old node to new cloned node.', 'DFS or BFS traversal.'],
    optimal_complexity: { time: 'O(V + E)', space: 'O(V)' }
  }),

  createProblem({
    id: 'dsa_top150_evaluate_division',
    title: 'Evaluate Division',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/evaluate-division/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an array of variable pairs equations and an array of real numbers values representing equations[i] = [Ai, Bi] and Ai / Bi = values[i]. Evaluate query division equations.',
    examples: [{ input: 'equations = [["a","b"],["b","c"]], values = [2.0,3.0], queries = [["a","c"],["b","a"]]', output: '[6.0,0.5]' }],
    hints: ['Weighted directed graph: edge (A -> B) has weight v, edge (B -> A) has weight 1/v.', 'Path product gives answer.'],
    optimal_complexity: { time: 'O(Q * (V + E))', space: 'O(V + E)' }
  }),

  createProblem({
    id: 'dsa_top150_course_schedule',
    title: 'Course Schedule',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/course-schedule/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take bi first if you want to take ai. Return true if you can finish all courses.',
    examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }, { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }],
    hints: ['Detect cycle in directed graph.', 'Kahn’s algorithm (topological sort using in-degrees).'],
    optimal_complexity: { time: 'O(V + E)', space: 'O(V + E)' }
  }),

  createProblem({
    id: 'dsa_top150_course_schedule_ii',
    title: 'Course Schedule II',
    topic_id: 'dsa_topic_graphs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/course-schedule-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Return the ordering of courses you should take to finish all courses. If impossible, return an empty array.',
    examples: [{ input: 'numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]', output: '[0,2,1,3]' }],
    hints: ['Topological sort: collect vertices in queue as in-degrees reach 0.'],
    optimal_complexity: { time: 'O(V + E)', space: 'O(V + E)' }
  }),

  // ================= GRAPH BFS (3 Problems) =================
  createProblem({
    id: 'dsa_top150_snakes_and_ladders',
    title: 'Snakes and Ladders',
    topic_id: 'dsa_topic_graph_bfs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/snakes-and-ladders/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Find the least number of dice rolls to reach square n^2 on a Boustrophedon-numbered board.',
    examples: [{ input: 'board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]', output: '4' }],
    hints: ['Shortest path on unweighted graph = BFS.', 'Track visited squares to avoid cycles.'],
    optimal_complexity: { time: 'O(N^2)', space: 'O(N^2)' }
  }),

  createProblem({
    id: 'dsa_top150_minimum_genetic_mutation',
    title: 'Minimum Genetic Mutation',
    topic_id: 'dsa_topic_graph_bfs',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/minimum-genetic-mutation/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Return the minimum number of mutations needed to mutate from startGene to endGene through valid genes in bank.',
    examples: [{ input: 'startGene = "AACCGGTT", endGene = "AACCGGTA", bank = ["AACCGGTA"]', output: '1' }],
    hints: ['BFS where neighbors differ by exactly 1 character.'],
    optimal_complexity: { time: 'O(B * L * 4)', space: 'O(B)' }
  }),

  createProblem({
    id: 'dsa_top150_word_ladder',
    title: 'Word Ladder',
    topic_id: 'dsa_topic_graph_bfs',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/word-ladder/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Return the number of words in the shortest transformation sequence from beginWord to endWord, or 0 if no sequence exists.',
    examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5' }],
    hints: ['Bidirectional BFS or standard BFS with word pattern hash map (*ot -> hot, dot, lot).'],
    optimal_complexity: { time: 'O(M^2 * N)', space: 'O(M^2 * N)' }
  }),

  // ================= TRIE (3 Problems) =================
  createProblem({
    id: 'dsa_top150_implement_trie_prefix_tree',
    title: 'Implement Trie (Prefix Tree)',
    topic_id: 'dsa_topic_trie',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/implement-trie-prefix-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Implement a trie with insert, search, and startsWith methods.',
    examples: [{ input: '["Trie", "insert", "search", "search", "startsWith", "insert", "search"]\n[[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]]', output: '[null, null, true, false, true, null, true]' }],
    hints: ['Each node has children array of size 26 and isEndOfWord boolean.'],
    optimal_complexity: { time: 'O(L) per op', space: 'O(Total chars)' }
  }),

  createProblem({
    id: 'dsa_top150_design_add_and_search_words_data_structure',
    title: 'Design Add and Search Words Data Structure',
    topic_id: 'dsa_topic_trie',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Design a data structure that supports adding new words and finding if a string matches any previously added string, including wildcard \'.\'.',
    examples: [{ input: '["WordDictionary","addWord","addWord","addWord","search","search","search","search"]\n[[],["bad"],["dad"],["mad"],["pad"],["bad"],[".ad"],["b.."]]', output: '[null,null,null,null,false,true,true,true]' }],
    hints: ['When \'.\' is encountered, branch into all 26 possible children.'],
    optimal_complexity: { time: 'O(M) search, O(26^M) wildcard worst', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_word_search_ii',
    title: 'Word Search II',
    topic_id: 'dsa_topic_trie',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/word-search-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an m x n board of characters and a list of strings words, return all words on the board.',
    examples: [{ input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' }],
    hints: ['Build a Trie of all dictionary words.', 'Perform DFS backtracking on the board walking along Trie edges simultaneously.'],
    optimal_complexity: { time: 'O(M * N * 4^L)', space: 'O(Total chars in words)' }
  }),

  // ================= BACKTRACKING (7 Problems) =================
  createProblem({
    id: 'dsa_top150_letter_combinations_of_a_phone_number',
    title: 'Letter Combinations of a Phone Number',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given a string containing digits from 2-9 inclusive, return all possible letter combinations that the number could represent.',
    examples: [{ input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]' }],
    hints: ['Map digits to letters.', 'Backtracking recursion building string letter-by-letter.'],
    optimal_complexity: { time: 'O(4^N)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_combinations',
    title: 'Combinations',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/combinations/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given two integers n and k, return all possible combinations of k numbers chosen from the range [1, n].',
    examples: [{ input: 'n = 4, k = 2', output: '[[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]' }],
    hints: ['Backtracking loop from start to n.'],
    optimal_complexity: { time: 'O(C(n, k))', space: 'O(k)' }
  }),

  createProblem({
    id: 'dsa_top150_permutations',
    title: 'Permutations',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/permutations/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array nums of distinct integers, return all the possible permutations.',
    examples: [{ input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }],
    hints: ['Swap elements or use a visited boolean array.'],
    optimal_complexity: { time: 'O(N!)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_combination_sum',
    title: 'Combination Sum',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/combination-sum/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.',
    examples: [{ input: 'candidates = [2,3,6,7], target = 7', output: '[[2,2,3],[7]]' }],
    hints: ['Elements may be chosen unlimited times: stay on same index when recurring.'],
    optimal_complexity: { time: 'O(2^T)', space: 'O(T)' }
  }),

  createProblem({
    id: 'dsa_top150_n_queens_ii',
    title: 'N-Queens II',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/n-queens-ii/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other. Return the number of distinct solutions.',
    examples: [{ input: 'n = 4', output: '2' }],
    hints: ['Bitmasks or boolean sets for columns, main diagonals (r - c), and anti-diagonals (r + c).'],
    optimal_complexity: { time: 'O(N!)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_generate_parentheses',
    title: 'Generate Parentheses',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/generate-parentheses/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.',
    examples: [{ input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' }],
    hints: ['Add \'(\' if open < n.', 'Add \')\' if close < open.'],
    optimal_complexity: { time: 'O(4^N / sqrt(N)) (Catalan)', space: 'O(N)' }
  }),

  createProblem({
    id: 'dsa_top150_word_search',
    title: 'Word Search',
    topic_id: 'dsa_topic_backtracking',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/word-search/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an m x n grid of characters board and a string word, return true if word exists in the grid.',
    examples: [{ input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' }],
    hints: ['DFS from each matching starting character.', 'Temporarily mask cell to \'#\' to avoid revisiting in same path.'],
    optimal_complexity: { time: 'O(M * N * 3^L)', space: 'O(L)' }
  }),

  // ================= DIVIDE & CONQUER (4 Problems) =================
  createProblem({
    id: 'dsa_top150_convert_sorted_array_to_binary_search_tree',
    title: 'Convert Sorted Array to Binary Search Tree',
    topic_id: 'dsa_topic_divide_conquer',
    difficulty: 'EASY',
    editorial_url: 'https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given an integer array nums where the elements are sorted in ascending order, convert it to a height-balanced binary search tree.',
    examples: [{ input: 'nums = [-10,-3,0,5,9]', output: '[0,-3,9,-10,null,5]' }],
    hints: ['Pick midpoint as root, recurse on left and right subarrays.'],
    optimal_complexity: { time: 'O(N)', space: 'O(log N)' }
  }),

  createProblem({
    id: 'dsa_top150_sort_list',
    title: 'Sort List',
    topic_id: 'dsa_topic_divide_conquer',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/sort-list/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Given the head of a linked list, return the list after sorting it in O(n log n) time and O(1) memory (i.e. constant space).',
    examples: [{ input: 'head = [4,2,1,3]', output: '[1,2,3,4]' }],
    hints: ['Bottom-up merge sort with step sizes 1, 2, 4, 8... achieves O(1) space.'],
    optimal_complexity: { time: 'O(N log N)', space: 'O(1)' }
  }),

  createProblem({
    id: 'dsa_top150_construct_quad_tree',
    title: 'Construct Quad Tree',
    topic_id: 'dsa_topic_divide_conquer',
    difficulty: 'MEDIUM',
    editorial_url: 'https://leetcode.com/problems/construct-quad-tree/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'Construct a QuadTree from an n x n grid.',
    examples: [{ input: 'grid = [[0,1],[1,0]]', output: '[[0,1],[1,0],[1,1],[1,1],[1,0]]' }],
    hints: ['Check if all values in current block are equal.', 'If not, divide into 4 quadrants.'],
    optimal_complexity: { time: 'O(N^2 log N)', space: 'O(log N)' }
  }),

  createProblem({
    id: 'dsa_top150_merge_k_sorted_lists',
    title: 'Merge k Sorted Lists',
    topic_id: 'dsa_topic_divide_conquer',
    difficulty: 'HARD',
    editorial_url: 'https://leetcode.com/problems/merge-k-sorted-lists/editorial/?envType=study-plan-v2&envId=top-interview-150',
    description: 'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    examples: [{ input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' }],
    hints: ['Divide & Conquer pairwise merging (like merge sort) or min-heap of size k.'],
    optimal_complexity: { time: 'O(N log k)', space: 'O(1)' }
  }),
];
