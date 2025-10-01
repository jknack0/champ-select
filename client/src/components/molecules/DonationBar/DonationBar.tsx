import Button from '../../atoms/Button'
import Card from '../../atoms/Card'
import Heading from '../../atoms/Heading'
import SelectBadge from '../../atoms/SelectBadge'
import SelectText from '../../atoms/SelectText'

type DonationBarProps = {
  amountLabel: string
  donationUrl: string
  onDonateClick: () => void
  hasPrefilledAmount: boolean
}

const DonationBar = ({ amountLabel, donationUrl, onDonateClick, hasPrefilledAmount }: DonationBarProps) => {
  const ariaLabel = hasPrefilledAmount && amountLabel ? `Donate ${amountLabel}` : 'Donate'

  return (
    <Card className="donation-bar">
      <div className="donation-bar-content">
        <Heading level={2}>Support the stream</Heading>
        <SelectText tone="muted">
          {hasPrefilledAmount && amountLabel
            ? `Donate ${amountLabel} on Streamlabs to claim your champion pick.`
            : 'Open the donation page in a new tab. Matching donations unlock the champion picker.'}
        </SelectText>
      </div>
      <div className="donation-actions">
        <Button
          variant="solid"
          ariaLabel={ariaLabel}
          onClick={onDonateClick}
        >
          Donate
        </Button>
        {hasPrefilledAmount ? <SelectBadge tone="info">Prefilled {amountLabel}</SelectBadge> : null}
        <SelectText as="span" tone="muted">
          {hasPrefilledAmount ? 'Opens Streamlabs with the preset amount.' : 'Enter the target amount once the page opens.'}
        </SelectText>
      </div>
      <SelectText tone="muted" as="span">
        Donation URL: {donationUrl}
      </SelectText>
    </Card>
  )
}

export default DonationBar

