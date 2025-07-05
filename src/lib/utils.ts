import { TreeItem } from "@/types"
import { Message } from "@inngest/agent-kit"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Conver a record of files to a tree structure
 * @param files - Record of file paths to content
 * @returns Tree structure for TreeView component
 * 
 * @example
 * Input: {"src/components/button.tsx": "...", "src/components/input.tsx": "...", "Readme.md": "..."}
 * Output: [["src", "components", "button.tsx"], ["src", "components", "input.tsx"], ["Readme.md"]]
 */
export function convertFilesToTreeItems(
  files: { [path: string]: string }
): TreeItem[] {
  console.log(files)
  interface TreeNode {
    [key: string]: TreeNode | null
  }

  const tree: TreeNode = {}

  const sortedPaths = Object.keys(files).sort()

  for (const filePath of sortedPaths) {
    const parts = filePath.split('/')
    let current = tree
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!current[part]) {
        current[part] = {}
      }
      current = current[part]
    }

    const filename = parts[parts.length - 1]
    current[filename] = null
  }

  function convertNode(node: TreeNode, name?: string): TreeItem[] | TreeItem {
    const entries = Object.entries(node)

    if (entries.length === 0) {
      return name || ''
    }

    const children: TreeItem[] = []
    for (const [key, value] of entries) {
      if (value === null) {
        // This is a file
        children.push(key)
      } else {
        // This is a folder
        const subTree = convertNode(value, key)
        if (Array.isArray(subTree)) {
          // If the subTree is an array, it means it has children
          children.push([key, ...subTree])
        } else {
          // If the subTree is not an array, it means it is a file
          children.push([key, subTree])
        }
      }
      console.log(children)
    }

    return children
  }

  const result = convertNode(tree)
  return Array.isArray(result) ? result : [result]
}

export const parseAgentOutput = (value: Message[]) => {
  const output = value[0]
  if (output.type !== 'text') {
    return "Fragment"
  }
  if (Array.isArray(output.content)) {
    return output.content.map((txt) => txt).join("")
  } else {
    return output.content
  }

}