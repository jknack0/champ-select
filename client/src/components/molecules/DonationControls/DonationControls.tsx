import type { InputHTMLAttributes } from 'react'
import { Button, Card, Heading, InlineError, TextInput } from '../../atoms'
import styles from './DonationControls.module.css'

type DonationControlsProps = {
  amount: string
  onAmountChange: (value: string) => void
  onSave: () => void
  isInvalid: boolean
  errorId?: string
  errorMessage?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
}

const DonationControls = ({
  amount,
  onAmountChange,
  onSave,
  isInvalid,
  errorId,
  errorMessage,
  inputMode = 'decimal',
}: DonationControlsProps) => (
  <Card>
    <Heading level={2}>Donation Settings</Heading>
    <TextInput
      id="donation-amount"
      label="Current Donation Amount"
      value={amount}
      onChange={onAmountChange}
      placeholder="e.g. 12.50"
      type="text"
      inputMode={inputMode}
      ariaInvalid={isInvalid}
      ariaDescribedBy={isInvalid ? errorId : undefined}
    />
    <div className={styles.footer}>
      <Button onClick={onSave}>Save Amount</Button>
      {isInvalid && errorId ? (
        <InlineError id={errorId}>{errorMessage ?? 'Enter a valid non-negative number.'}</InlineError>
      ) : null}
    </div>
  </Card>
)

export default DonationControls
