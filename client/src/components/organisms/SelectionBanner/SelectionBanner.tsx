import type { Selection } from '../../pages/ChampSelect/types'
import Card from '../../atoms/Card'
import SelectBadge from '../../atoms/SelectBadge'
import SelectText from '../../atoms/SelectText'

const SelectionBanner = ({ selection }: { selection: Selection }) => (
  <Card className="selection-banner">
    <SelectBadge tone="success">Thanks!</SelectBadge>
    <div className="selection-banner-body">
      <SelectText tone="muted">You locked in:</SelectText>
      <span className="selection-banner-champion">{selection.name}</span>
      <SelectText tone="muted" as="span">
        {new Date(selection.selectedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </SelectText>
    </div>
  </Card>
)

export default SelectionBanner

