import { ReactNode } from "react"

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
}

export function Button({ children, onClick, type = "button" }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}

export function ConfirmButton({ onClick }: { onClick?: () => void }) {
  return <Button onClick={onClick}>확인</Button>
}

export function CancelButton({ onClick }: { onClick?: () => void }) {
  return <Button onClick={onClick}>취소</Button>
}