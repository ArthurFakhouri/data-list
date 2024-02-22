import { CheckIcon } from "lucide-react";
import { ComponentProps, forwardRef } from "react";
import { tv } from "tailwind-variants";

const input = tv({
    base: 'flex justify-center items-center transition background delay-50 disabled:opacity-50 w-5 h-5 rounded-md',

    variants: {
        variant: {
            default:
                'border border-zinc-800 hover:border-zinc-700',
            checked:
                'bg-teal-600 hover:bg-teal-700',
        },
    },

    defaultVariants: {
        variant: 'default',
    },
})

export interface InputProps extends ComponentProps<'input'> { }

export const Checkbox = forwardRef<HTMLInputElement, InputProps>(({ className, checked, ...props }, ref) => {
    return (
        <label className="cursor-pointer">
            <input ref={ref}  {...props} type="checkbox" checked={checked} className="absolute opacity-0 w-0 h-0" />
            <div className={input({ variant: checked ? "checked" : "default", className })}>
                {checked && <CheckIcon className="size-3" />}
            </div>
        </label>
    )
})