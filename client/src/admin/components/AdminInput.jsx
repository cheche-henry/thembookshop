import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Form'

export { Input, Select, Textarea }

export function Btn({ variant = 'primary', loading = false, ...props }) {
  return <Button variant={variant} loading={loading} {...props} />
}
