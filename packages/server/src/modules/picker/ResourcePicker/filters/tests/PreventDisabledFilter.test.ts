import { PreventDisabledFilter } from "../PreventDisabledFilter";
import { ResourceVO } from "#modules/resources/models";
import { EPISODES_SIMPSONS } from "#tests/main/db/fixtures";

const ENABLED_NO_DISABLED: ResourceVO = {
  ...EPISODES_SIMPSONS[0],
};

delete ENABLED_NO_DISABLED.disabled;
const DISABLED: ResourceVO = {
  ...ENABLED_NO_DISABLED,
  disabled: true,
};
const ENABLED_DISABLED_FALSE: ResourceVO = {
  ...ENABLED_NO_DISABLED,
  disabled: false,
};
const ENABLED_DISABLED_UNDEFINED: ResourceVO = {
  ...ENABLED_NO_DISABLED,
  disabled: undefined,
};

type Case = [ResourceVO, boolean];

describe.each([
  [DISABLED, false],
  [ENABLED_NO_DISABLED, true],
  [ENABLED_DISABLED_FALSE, true],
  [ENABLED_DISABLED_UNDEFINED, true],
] as Case[])("preventDisabledFilter", (self, expected) => {
  it(`should return ${expected} when disabled = ${self.disabled}`, async () => {
    const filter = new PreventDisabledFilter();
    const result = await filter.filter(self);

    expect(result).toBe(expected);
  } );
} );
